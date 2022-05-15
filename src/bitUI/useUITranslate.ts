import { useCallback } from 'react';

export function useUITranslate() {
    const lang = 'zh-Hant';
    return translate[lang as keyof typeof translate];
}

type Data = { [key: string]: string };
export function useUITranslateTpl() {
    const lang = 'zh-Hant';
    const langObj = translate[lang as keyof typeof translate];
    return useCallback(
        (key: keyof typeof translate['en'], data?: Data) => {
            const str = langObj[key];
            if (!str) {
                return key;
            }
            if (data) {
                return tplStr(str, data);
            }
            return str;
        },
        [langObj],
    );
}

export function tplStr<T extends { [key: string]: string }>(
    str: string,
    data: T,
) {
    let msg = str;
    for (const key in data) {
        if (!data.hasOwnProperty(key)) {
            continue;
        }
        msg = msg.replace(new RegExp(`{${key}}`, 'g'), data[key] + '');
    }

    return msg;
}

const translate = {
    en: {
        emptyTip: 'No data',
        endTip: '~End~',
        copy_success: 'Successfully copied!',
        copy: 'Copy',
        start_time: 'Start Time',
        end_time: 'End Time',
        recently: 'Past {recently} days',
        recentlyMin: '{recently} days',
        btn_reset: 'Reset',
        confirm: 'Confirm',
        select_date: 'Select date',
        cancel: 'Cancel',
        tips: 'Tips',
    },
    tr: {
        emptyTip: 'Veri yok',
        endTip: 'Son',
        copy_success: 'Başarıyla kopyalandı!',
        copy: 'Kopyala',
        start_time: 'Başlangıç Saati',
        end_time: 'Bitiş Saati',
        recently: 'Geçmiş {recently} gün',
        recentlyMin: '{recently} gün',
        btn_reset: 'Sıfırla',
        confirm: 'Onayla',
        select_date: 'Tarih seç',
        cancel: 'İptal',
        tips: 'İpuçları',
    },
    ja: {
        emptyTip: 'データなし',
        endTip: '~End~',
        copy_success: 'コピーしました！',
        copy: 'コピー',
        start_time: '開始時間',
        end_time: '終了時間',
        recently: '最近{recently}日',
        recentlyMin: '{recently}日',
        btn_reset: 'リセット',
        confirm: '確認',
        select_date: '日時選択',
        cancel: 'キャンセル',
        tips: '提示',
    },
    ko: {
        emptyTip: '데이터 없음',
        endTip: '~End~',
        copy_success: '복사성공!',
        copy: '복사',
        start_time: '시작시간',
        end_time: '종료시간',
        recently: '최근 {recently}일',
        recentlyMin: '{recently}일',
        btn_reset: '초기화',
        confirm: '확인',
        select_date: '날짜선택',
        cancel: '취소',
        tips: '알림',
    },
    vi: {
        emptyTip: 'Không có dữ liệu',
        endTip: '~End~',
        copy_success: 'Sao chép thành công!',
        copy: 'Sao chép',
        start_time: 'Thời gian bắt đầu',
        end_time: 'Thời gian kết thúc',
        recently: '{recently} ngày',
        recentlyMin: '{recently} ngày',
        btn_reset: 'Đặt lại',
        confirm: 'Xác nhận',
        select_date: 'Chọn ngày',
        cancel: 'Hủy bỏ',
        tips: 'Nhắc nhở',
    },
    'zh-Hans': {
        emptyTip: '暂无数据',
        endTip: '~End~',
        copy_success: '复制成功!',
        copy: '复制',
        start_time: '开始时间',
        end_time: '结束时间',
        recently: '最近{recently}天',
        recentlyMin: '{recently}天',
        btn_reset: '重置',
        confirm: '确定',
        select_date: '日期选择',
        cancel: '取消',
        tips: '提示',
    },
    'zh-Hant': {
        emptyTip: '暂无数据',
        endTip: '~End~',
        copy_success: '複製成功!',
        copy: '複製',
        start_time: '开始时间',
        end_time: '结束时间',
        recently: '最近{recently}天',
        recentlyMin: '{recently}天',
        btn_reset: '重置',
        confirm: '確定',
        select_date: '日期選擇',
        cancel: '取消',
        tips: '提示',
    },
    pt: {
        emptyTip: 'Sem dados',
        endTip: '~Fim~',
        copy_success: 'Cópia feita com sucesso!',
        copy: 'Copiar',
        start_time: 'Hora de início',
        end_time: 'Hora de encerramento',
        recently: 'Últimos {recently} dias',
        recentlyMin: '{recently} dias',
        btn_reset: 'Reset',
        confirm: 'Confirmar',
        select_date: 'Selecionar a data',
        cancel: 'Cancelar',
        tips: 'Dicas',
    },
};
