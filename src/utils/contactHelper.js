/**
 * 联系人辅助工具类
 * 用于联系人导入/导出、去重、一键修复等功能
 */

/**
 * 从系统通讯录导入联系人
 * @returns {Promise<Array>} 导入的联系人列表
 */
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

            // 查询联系人
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

                const processedPhones = new Set(); // 用于去重

                while (cursor.moveToNext()) {
                    const name = cursor.getString(nameIndex) || '';
                    const phone = cursor.getString(phoneIndex) || '';
                    const photoUri = cursor.getString(photoIndex);

                    // 清理手机号（移除空格、横线等）
                    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

                    // 跳过无效的联系人
                    if (!name || !cleanPhone || cleanPhone.length < 7) {
                        continue;
                    }

                    // 去重：如果同一个手机号已经处理过，跳过
                    if (processedPhones.has(cleanPhone)) {
                        continue;
                    }
                    processedPhones.add(cleanPhone);

                    // 构建联系人对象
                    const contact = {
                        name: name.trim(),
                        wxNote: name.trim(), // 默认使用姓名作为微信备注
                        mobile: cleanPhone,
                        icon: photoUri || '/static/mgc/geren.png',
                        group: 'other' // 默认分组为"其他"
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
        // H5或其他平台，返回空数组
        console.warn('当前平台不支持导入系统联系人');
        resolve([]);
        // #endif
    });
}

/**
 * 导出联系人为JSON文件
 * @param {Array} contacts 联系人列表
 * @returns {Promise}
 */
export function exportContacts(contacts) {
    return new Promise((resolve, reject) => {
        try {
            const dataStr = JSON.stringify(contacts, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            // #ifdef APP-PLUS
            // 在APP中保存文件
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
            // H5环境，下载文件
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

/**
 * 从JSON文件导入联系人
 * @param {String} filePath 文件路径
 * @returns {Promise<Array>} 导入的联系人列表
 */
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

/**
 * 检测并合并重复联系人
 * @param {Array} contacts 联系人列表
 * @returns {Object} { merged: 合并后的列表, duplicates: 重复项信息 }
 */
export function detectAndMergeDuplicates(contacts) {
    const merged = [];
    const duplicates = [];
    const processed = new Map(); // key: mobile, value: index in merged array

    contacts.forEach((contact, index) => {
        const mobile = contact.mobile ? contact.mobile.replace(/[\s\-\(\)]/g, '') : '';

        if (!mobile) {
            // 没有手机号的联系人，直接添加
            merged.push(contact);
            return;
        }

        // 检查是否已存在相同手机号
        if (processed.has(mobile)) {
            const existingIndex = processed.get(mobile);
            const existing = merged[existingIndex];

            // 记录重复信息
            duplicates.push({
                original: existing,
                duplicate: contact,
                merged: mergeContactInfo(existing, contact)
            });

            // 合并联系人信息
            merged[existingIndex] = mergeContactInfo(existing, contact);
        } else {
            // 新联系人，添加到列表
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

/**
 * 合并两个联系人信息（保留更完整的信息）
 * @param {Object} contact1 联系人1
 * @param {Object} contact2 联系人2
 * @returns {Object} 合并后的联系人
 */
function mergeContactInfo(contact1, contact2) {
    return {
        name: contact1.name || contact2.name,
        wxNote: contact1.wxNote || contact2.wxNote || contact1.name || contact2.name,
        mobile: contact1.mobile || contact2.mobile,
        icon: contact1.icon && contact1.icon !== '/static/mgc/geren.png' ? contact1.icon : contact2.icon,
        group: contact1.group || contact2.group || 'other'
    };
}

/**
 * 一键修复联系人
 * 功能包括：
 * 1. 去重合并
 * 2. 同步到云端（如果已登录）
 * 3. 验证和修复数据格式
 * @returns {Promise<Object>} 修复结果
 */
export async function repairContacts() {
    try {
        let contacts = uni.getStorageSync('contacts') || [];
        const originalCount = contacts.length;

        // 1. 去重合并
        const duplicateResult = detectAndMergeDuplicates(contacts);
        contacts = duplicateResult.merged;

        // 2. 验证和修复数据格式
        contacts = contacts.map(contact => {
            // 确保必填字段存在
            if (!contact.name && contact.wxNote) {
                contact.name = contact.wxNote;
            }
            if (!contact.wxNote && contact.name) {
                contact.wxNote = contact.name;
            }

            // 清理手机号格式
            if (contact.mobile) {
                contact.mobile = contact.mobile.replace(/[\s\-\(\)]/g, '');
            }

            // 确保有默认图标
            if (!contact.icon) {
                contact.icon = '/static/mgc/geren.png';
            }

            // 确保有默认分组
            if (!contact.group) {
                contact.group = 'other';
            }

            return contact;
        });

        // 3. 保存修复后的联系人
        uni.setStorageSync('contacts', contacts);

        // 4. 尝试同步到云端（如果后端服务可用）
        try {
            // 动态导入API工具类
            const apiModule = await import('@/utils/api.js');
            if (apiModule.default && apiModule.default.syncUtils) {
                await apiModule.default.syncUtils.syncContacts(contacts);
            }
        } catch (e) {
            // 云端同步是可选的，失败不影响修复功能
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

/**
 * 验证联系人数据格式
 * @param {Object} contact 联系人对象
 * @returns {Object} { valid: Boolean, errors: Array }
 */
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

