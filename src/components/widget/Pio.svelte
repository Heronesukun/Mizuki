<script>
import { onDestroy, onMount } from "svelte";
import { pioConfig } from "@/config";

// 判断是否为 Cubism 3/4/5 模型
const isCubismModel = (modelPath) => {
	return modelPath && (modelPath.endsWith('.model3.json') || modelPath.endsWith('.model.json'));
};

// 获取主要模型路径
const mainModel = pioConfig.models && pioConfig.models.length > 0 
	? pioConfig.models[0] 
	: "/pio/models/pio/model.json";

// 判断是否使用 Cubism 3/4/5
const useCubism = isCubismModel(mainModel);

// 将配置转换为 Pio 插件需要的格式
const pioOptions = {
	mode: pioConfig.mode,
	hidden: pioConfig.hiddenOnMobile,
	content: pioConfig.dialog || {},
	model: pioConfig.models || ["/pio/models/pio/model.json"],
};

// 全局变量
let pioInstance = null;
let pixiApp = null;
let live2dModel = null;
let pioInitialized = false;
let pioContainer;
let pioCanvas;

// 初始化旧版 Pio (Cubism 2)
function initPio() {
	if (typeof window !== "undefined" && typeof Paul_Pio !== "undefined") {
		try {
			if (pioContainer && pioCanvas && !pioInitialized) {
				pioInstance = new Paul_Pio(pioOptions);
				pioInitialized = true;
				console.log("Pio initialized successfully (Cubism 2)");
			} else if (!pioContainer || !pioCanvas) {
				console.warn("Pio DOM elements not found, retrying...");
				setTimeout(initPio, 100);
			}
		} catch (e) {
			console.error("Pio initialization error:", e);
		}
	} else {
		setTimeout(initPio, 100);
	}
}

// 获取 Live2DModel 类
function getLive2DModelClass() {
	if (typeof window !== 'undefined') {
		// 方式1: PIXI.live2d.Live2DModel
		if (window.PIXI && window.PIXI.live2d && window.PIXI.live2d.Live2DModel) {
			return window.PIXI.live2d.Live2DModel;
		}
		// 方式2: window.Live2DModel
		if (window.Live2DModel) {
			return window.Live2DModel;
		}
	}
	return null;
}

// 初始化 Cubism 3/4/5 模型
async function initCubism() {
	if (typeof window === "undefined") return;
	
	try {
		if (!pioCanvas) {
			console.warn("Canvas not found, retrying...");
			setTimeout(initCubism, 100);
			return;
		}

		const modelPath = mainModel;
		console.log("Loading Cubism model:", modelPath);
		
		// 获取 Live2DModel 类
		const Live2DModel = getLive2DModelClass();
		console.log("Live2DModel class found:", !!Live2DModel);
		
		if (!Live2DModel) {
			console.error("Live2DModel not found!");
			console.log("PIXI:", typeof PIXI);
			console.log("PIXI.live2d:", typeof (PIXI && PIXI.live2d));
			console.log("window.Live2DModel:", typeof window.Live2DModel);
			throw new Error("Live2DModel class not found");
		}

		// 加载模型
		console.log("Loading model from:", modelPath);
		const model = await Live2DModel.from(modelPath, {
			autoUpdate: true,
			autoInteract: true,
		});
		
		live2dModel = model;
		console.log("Model loaded:", model);
		
		// 创建 PixiJS 应用 (PixiJS v7 方式)
		const app = new PIXI.Application({
			width: pioConfig.width || 320,
			height: pioConfig.height || 350,
			backgroundAlpha: 0,
			view: pioCanvas,
			resizeTo: pioCanvas,
		});
		
		pixiApp = app;
		
		// 添加模型到舞台
		app.stage.addChild(model);
		
		// 设置模型 - 调整大小
		const scale = 0.11;
		model.scale.set(scale);
		model.anchor.set(0.5, 0.5);
		model.position.set(
			(pioConfig.width || 320) / 2,
			(pioConfig.height || 350) / 2 + 30
		);
		
		// 启用交互 - 点击和拖动
		model.interactive = true;
		model.buttonMode = true;
		
		// 点击事件
		model.on('pointertap', (event) => {
			console.log('Model clicked!');
			window.dispatchEvent(new CustomEvent('live2d:click'));
		});
		
		// 拖动事件
		let isDragging = false;
		let dragOffset = { x: 0, y: 0 };
		
		pioCanvas.addEventListener('pointerdown', (e) => {
			isDragging = true;
			dragOffset.x = e.clientX - model.position.x;
			dragOffset.y = e.clientY - model.position.y;
			console.log('Drag started');
		});
		
		pioCanvas.addEventListener('pointermove', (e) => {
			if (isDragging) {
				model.position.x = e.clientX - dragOffset.x;
				model.position.y = e.clientY - dragOffset.y;
			}
		});
		
		pioCanvas.addEventListener('pointerup', () => {
			isDragging = false;
			console.log('Drag ended');
		});
		
		pioCanvas.addEventListener('pointerleave', () => {
			isDragging = false;
		});
		
		pioInitialized = true;
		console.log("Cubism model initialized successfully!");
		
	} catch (e) {
		console.error("Cubism initialization error:", e);
		console.log("Falling back to original Pio...");
		loadPioAssets();
	}
}

// 加载旧版 Cubism 2
function loadPioAssets() {
	if (typeof window === "undefined") return;

	const loadScript = (src, id) => {
		return new Promise((resolve, reject) => {
			if (document.querySelector(`#${id}`)) {
				resolve();
				return;
			}
			const script = document.createElement("script");
			script.id = id;
			script.src = src;
			script.onload = resolve;
			script.onerror = reject;
			document.head.appendChild(script);
		});
	};

	loadScript("/pio/static/l2d.js", "pio-l2d-script")
		.then(() => loadScript("/pio/static/pio.js", "pio-main-script"))
		.then(() => {
			setTimeout(initPio, 100);
		})
		.catch((error) => {
			console.error("Failed to load Pio scripts:", error);
		});
}

// 加载 Cubism 3/4/5 所需脚本
function loadCubismAssets() {
	if (typeof window === "undefined") return;

	const loadScript = (src, id) => {
		return new Promise((resolve, reject) => {
			if (document.querySelector(`#${id}`)) {
				console.log(`Script ${id} already loaded`);
				resolve();
				return;
			}
			const script = document.createElement("script");
			script.id = id;
			script.src = src;
			script.onload = () => {
				console.log(`Loaded: ${id}`);
				resolve();
			};
			script.onerror = (e) => {
				console.error(`Failed to load: ${id}`, e);
				reject(e);
			};
			document.head.appendChild(script);
		});
	};

	// 使用官方 Live2D Cubism 5 Core
	loadScript("/pio/static/pixi.min.js", "pixi-script")
		.then(() => {
			console.log("PixiJS loaded, version:", PIXI?.VERSION);
			// 加载 Cubism 5 Core (从官方源)
			return loadScript("/pio/static/live2dcubismcore.min.js", "cubism-core-script");
		})
		.then(() => {
			console.log("Cubism Core loaded");
			// 加载 l2d.js (Cubism 2 兼容层)
			return loadScript("/pio/static/l2d.js", "live2d-script");
		})
		.then(() => {
			console.log("Live2D loaded");
			// 加载 pixi-live2d-display
			return loadScript("/pio/static/pixi-live2d.min.js", "pixi-live2d-script");
		})
		.then(() => {
			console.log("All Cubism assets loaded, initializing...");
			setTimeout(initCubism, 500);
		})
		.catch((error) => {
			console.error("Failed to load Cubism scripts:", error);
			loadPioAssets();
		});
}

onMount(() => {
	if (!pioConfig.enable) return;

	if (pioConfig.hiddenOnMobile && window.matchMedia("(max-width: 1280px)").matches) {
        return;
    }

	if (useCubism) {
		console.log("Using Cubism mode (3/4/5)");
		loadCubismAssets();
	} else {
		console.log("Using Cubism 2 mode");
		loadPioAssets();
	}
});

onDestroy(() => {
	if (pixiApp) {
		pixiApp.destroy(true);
	}
	console.log("Pio Svelte component destroyed");
});
</script>

{#if pioConfig.enable}
  <div class={`pio-container ${pioConfig.position || 'right'}`} bind:this={pioContainer}>
    <div class="pio-action"></div>
    <canvas 
      id="pio" 
      bind:this={pioCanvas}
      width={pioConfig.width || (useCubism ? 320 : 280)} 
      height={pioConfig.height || (useCubism ? 350 : 250)}
    ></canvas>
  </div>
{/if}

<style>
</style>
