// 本地番剧数据配置
export type AnimeItem = {
	title: string;
	status: "watching" | "completed" | "planned";
	rating: number;
	cover: string;
	description: string;
	episodes: string;
	year: string;
	genre: string[];
	studio: string;
	link: string;
	progress: number;
	totalEpisodes: number;
	startDate: string;
	endDate: string;
};

const localAnimeList: AnimeItem[] = [
	{
		title: "Is the Order a Rabbit?",
		status: "completed",
		rating: 9.7,
		cover: "/assets/anime/tz1.webp",
		description: "A group of girls' warm daily life",
		episodes: "12 episodes",
		year: "2014",
		genre: ["日常", "治愈"],
		studio: "White Fox",
		link: "https://www.bilibili.com/bangumi/media/md191",
		progress: 12,
		totalEpisodes: 12,
		startDate: "2014-04",
		endDate: "2014-06",
	},
	{
		title: "Is the Order a Rabbit??",
		status: "completed",
		rating: 9.8,
		cover: "/assets/anime/tz2.webp",
		description: "A group of girls' warm daily life",
		episodes: "12 episodes",
		year: "2015",
		genre: ["日常", "治愈"],
		studio: "White Fox",
		link: "https://www.bilibili.com/bangumi/media/md2762",
		progress: 12,
		totalEpisodes: 12,
		startDate: "2015-10",
		endDate: "2015-12",
	},
	{
		title: "Is the Order a Rabbit? BLOOM",
		status: "completed",
		rating: 9.9,
		cover: "/assets/anime/tz3.webp",
		description: "A group of girls' warm daily life",
		episodes: "12 episodes",
		year: "2020",
		genre: ["日常", "治愈"],
		studio: "White Fox",
		link: "https://www.bilibili.com/bangumi/media/md28229884",
		progress: 12,
		totalEpisodes: 12,
		startDate: "2020-10",
		endDate: "2020-12",
	},
	{
		title: "少女终末旅行",
		status: "completed",
		rating: 9.8,
		cover: "/assets/anime/snzmlx.webp",
		description: "人类繁华的文明迎来终结的很久以后，人类基本灭绝，甚至生物都不再存在的末日世界。",
		episodes: "12 episodes",
		year: "2020",
		genre: ["末日", "治愈", "致郁"],
		studio: "White Fox",
		link: "https://www.bilibili.com/bangumi/media/md6463",
		progress: 12,
		totalEpisodes: 12,
		startDate: "2017-10",
		endDate: "2017-12",
	},
];

export default localAnimeList;
