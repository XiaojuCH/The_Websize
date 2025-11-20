// Bangumi API 集成
const BANGUMI_USER_ID = '799366';
const BANGUMI_API = 'https://api.bgm.tv';

// 状态映射
const STATUS_MAP = {
    1: 'plan',      // 想看/想玩
    2: 'watched',   // 看过/玩过
    3: 'watching',  // 在看/在玩
    4: 'dropped'    // 搁置
};

// 从 Bangumi 获取收藏数据
async function fetchBangumiCollection(subjectType) {
    try {
        const allCollections = [];
        const types = [1, 2, 3, 4]; // 想看、在看、看过、搁置

        for (const type of types) {
            const response = await fetch(
                `${BANGUMI_API}/v0/users/${BANGUMI_USER_ID}/collections?subject_type=${subjectType}&type=${type}&limit=100&offset=0`,
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    allCollections.push(...data.data);
                }
            }
        }

        return allCollections;
    } catch (error) {
        console.error('获取 Bangumi 数据失败:', error);
        return [];
    }
}

// 转换番剧数据
async function loadAnimeFromBangumi() {
    const collections = await fetchBangumiCollection(2); // 2 = 动画

    const animeList = collections.map(item => ({
        id: item.subject_id,
        title: item.subject.name_cn || item.subject.name,
        titleEn: item.subject.name,
        cover: item.subject.images?.large || item.subject.images?.common || '',
        rating: item.subject.score || 0,  // 使用条目评分而不是个人评分
        status: STATUS_MAP[item.type] || 'plan',
        type: 'TV',
        episodes: item.subject.eps || 0,
        watchedEps: item.ep_status || 0,
        year: item.subject.date ? new Date(item.subject.date).getFullYear() : 0,
        tags: item.subject.tags?.slice(0, 5).map(t => t.name) || [],
        summary: item.subject.short_summary || '',
        comment: item.comment || ''
    }));

    return {
        animeList,
        statusLabels: {
            watched: '看过',
            watching: '在看',
            plan: '想看',
            dropped: '搁置'
        },
        typeLabels: {
            TV: 'TV动画',
            Movie: '剧场版',
            OVA: 'OVA',
            ONA: '网络动画'
        }
    };
}

// 获取完整的条目详情（包括完整简介）
async function fetchSubjectDetail(subjectId) {
    try {
        const response = await fetch(
            `${BANGUMI_API}/v0/subjects/${subjectId}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            }
        );

        if (response.ok) {
            const data = await response.json();
            return data.summary || '';
        }
        return '';
    } catch (error) {
        console.error('获取条目详情失败:', error);
        return '';
    }
}

// 转换 Galgame 数据
async function loadGalgameFromBangumi() {
    const collections = await fetchBangumiCollection(4); // 4 = 游戏

    const galgameList = collections.map(item => ({
        id: item.subject_id,
        title: item.subject.name_cn || item.subject.name,
        titleEn: item.subject.name,
        cover: item.subject.images?.large || item.subject.images?.common || '',
        rating: item.subject.score || 0,  // 使用条目评分而不是个人评分
        status: STATUS_MAP[item.type] === 'watched' ? 'completed' :
                STATUS_MAP[item.type] === 'watching' ? 'playing' :
                STATUS_MAP[item.type] || 'plan',
        platform: 'PC',
        releaseYear: item.subject.date ? new Date(item.subject.date).getFullYear() : 0,
        developer: item.subject.platform || '',
        tags: item.subject.tags?.slice(0, 5).map(t => t.name) || [],
        summary: item.subject.short_summary || '',
        comment: item.comment || ''
    }));

    return {
        galgameList,
        statusLabels: {
            completed: '已通关',
            playing: '游玩中',
            plan: '想玩',
            dropped: '搁置'
        },
        platformLabels: {
            PC: 'PC',
            PSV: 'PSV',
            Switch: 'Switch',
            PS4: 'PS4',
            Mobile: '移动端'
        }
    };
}
