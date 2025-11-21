export function importFromSystemContacts() {
    return new Promise((resolve, reject) => {
        // #ifdef APP-PLUS
        try {
            const main = plus.android.runtimeMainActivity();
            const ContactsContract = plus.android.importClass('android.provider.ContactsContract');
            const ContentResolver = plus.android.importClass('android.content.ContentResolver');
            const Cursor = plus.android.importClass('android.database.Cursor');

            const resolver = main.getContentResolver();
            const contacts = [];
            const cursor = resolver.query(
                ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                null,
                null,
                null,
                ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME + ' ASC'
            );

            if (cursor) {
                const nameIndex = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME);
                const phoneIndex = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER);
                const photoIndex = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.PHOTO_URI);
                const processedPhones = new Set();

                while (cursor.moveToNext()) {
                    const name = cursor.getString(nameIndex) || '';
                    const phone = cursor.getString(phoneIndex) || '';
                    const photoUri = cursor.getString(photoIndex);
                    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

                    if (!name || !cleanPhone || cleanPhone.length < 7) {
                        continue;
                    }

                    if (processedPhones.has(cleanPhone)) {
                        continue;
                    }
                    processedPhones.add(cleanPhone);

                    const contact = {
                        name: name.trim(),
                        wxNote: name.trim(),
                        mobile: cleanPhone,
                        icon: photoUri || '/static/mgc/geren.png',
                        group: 'other'
                    };

                    contacts.push(contact);
                }

                cursor.close();
            }

            resolve(contacts);
        } catch (e) {
            console.error('导入联系人失败:', e);
            reject(e);
        }
        // #endif

        // #ifndef APP-PLUS
        console.warn('当前平台不支持导入系统联系人');
        resolve([]);
        // #endif
    });
}

export function exportContacts(contacts) {
    return new Promise((resolve, reject) => {
        try {
            const dataStr = JSON.stringify(contacts, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            // #ifdef APP-PLUS
            const fileName = `contacts_backup_${Date.now()}.json`;
            const filePath = plus.io.convertLocalFileSystemURL(`_downloads/${fileName}`);

            plus.io.resolveLocalFileSystemURL('_downloads', (entry) => {
                entry.getFile(fileName, { create: true, exclusive: false }, (fileEntry) => {
                    fileEntry.createWriter((writer) => {
                        writer.write(dataBlob);
                        writer.onwriteend = () => {
                            uni.showToast({
                                title: `已导出到下载文件夹`,
                                icon: 'success'
                            });
                            resolve(filePath);
                        };
                        writer.onerror = (e) => {
                            reject(e);
                        };
                    });
                });
            });
            // #endif

            // #ifdef H5
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `contacts_backup_${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);
            resolve();
            // #endif
        } catch (e) {
            console.error('导出联系人失败:', e);
            reject(e);
        }
    });
}

export function importContactsFromFile(filePath) {
    return new Promise((resolve, reject) => {
        // #ifdef APP-PLUS
        try {
            plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
                entry.file((file) => {
                    const reader = new FileReader();
                    reader.onloadend = (e) => {
                        try {
                            const contacts = JSON.parse(e.target.result);
                            if (Array.isArray(contacts)) {
                                resolve(contacts);
                            } else {
                                reject(new Error('文件格式错误'));
                            }
                        } catch (e) {
                            reject(new Error('文件解析失败'));
                        }
                    };
                    reader.onerror = () => {
                        reject(new Error('文件读取失败'));
                    };
                    reader.readAsText(file);
                });
            });
        } catch (e) {
            reject(e);
        }
        // #endif

        // #ifndef APP-PLUS
        reject(new Error('当前平台不支持文件导入'));
        // #endif
    });
}

export function detectAndMergeDuplicates(contacts) {
    const merged = [];
    const duplicates = [];
    const processed = new Map();

    contacts.forEach((contact, index) => {
        const mobile = contact.mobile ? contact.mobile.replace(/[\s\-\(\)]/g, '') : '';

        if (!mobile) {
            merged.push(contact);
            return;
        }

        if (processed.has(mobile)) {
            const existingIndex = processed.get(mobile);
            const existing = merged[existingIndex];

            duplicates.push({
                original: existing,
                duplicate: contact,
                merged: mergeContactInfo(existing, contact)
            });

            merged[existingIndex] = mergeContactInfo(existing, contact);
        } else {
            merged.push(contact);
            processed.set(mobile, merged.length - 1);
        }
    });

    return {
        merged,
        duplicates,
        count: duplicates.length
    };
}

function mergeContactInfo(contact1, contact2) {
    return {
        name: contact1.name || contact2.name,
        wxNote: contact1.wxNote || contact2.wxNote || contact1.name || contact2.name,
        mobile: contact1.mobile || contact2.mobile,
        icon: contact1.icon && contact1.icon !== '/static/mgc/geren.png' ? contact1.icon : contact2.icon,
        group: contact1.group || contact2.group || 'other'
    };
}

export async function repairContacts() {
    try {
        let contacts = uni.getStorageSync('contacts') || [];
        const originalCount = contacts.length;

        const duplicateResult = detectAndMergeDuplicates(contacts);
        contacts = duplicateResult.merged;

        contacts = contacts.map(contact => {
            if (!contact.name && contact.wxNote) {
                contact.name = contact.wxNote;
            }
            if (!contact.wxNote && contact.name) {
                contact.wxNote = contact.name;
            }

            if (contact.mobile) {
                contact.mobile = contact.mobile.replace(/[\s\-\(\)]/g, '');
            }

            if (!contact.icon) {
                contact.icon = '/static/mgc/geren.png';
            }

            if (!contact.group) {
                contact.group = 'other';
            }

            return contact;
        });

        uni.setStorageSync('contacts', contacts);

        try {
            const apiModule = await import('@/utils/api.js');
            if (apiModule.default && apiModule.default.syncUtils) {
                await apiModule.default.syncUtils.syncContacts(contacts);
            }
        } catch (e) {
            console.log('云端同步失败（可选）:', e);
        }

        return {
            success: true,
            originalCount,
            finalCount: contacts.length,
            mergedCount: duplicateResult.count,
            message: `修复完成：合并了${duplicateResult.count}个重复联系人，共${contacts.length}个联系人`
        };
    } catch (e) {
        console.error('一键修复失败:', e);
        return {
            success: false,
            message: '修复失败：' + (e.message || '未知错误')
        };
    }
}

export function validateContact(contact) {
    const errors = [];

    if (!contact.name && !contact.wxNote) {
        errors.push('姓名或微信备注至少填写一个');
    }

    if (!contact.mobile) {
        errors.push('手机号不能为空');
    } else {
        const cleanPhone = contact.mobile.replace(/[\s\-\(\)]/g, '');
        if (!/^1\d{10}$/.test(cleanPhone)) {
            errors.push('手机号格式不正确');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

