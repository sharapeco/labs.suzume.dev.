const targetMap = new WeakMap();

//依存関係にある処理を保持するactiveEffect
let activeEffect = null;

function track(target, key) {
	//activeEffectが存在するときに登録するようにする。
	if (activeEffect) {
		let depsMap = targetMap.get(target);
		if (!depsMap) {
			depsMap = new Map();
			targetMap.set(target, depsMap);
		}
		let dep = depsMap.get(key);
		if (!dep) {
			dep = new Set();
			depsMap.set(key, dep);
		}
		dep.add(activeEffect);
	}
}

function trigger(target, key) {
	const depsMap = targetMap.get(target);
	if (!depsMap) return;

	const dep = depsMap.get(key);
	if (!dep) return;

	for (const effect of dep) {
		effect();
	}
}

function reactive(target) {
	const handler = {
		get(target, key, receiver) {
			const result = Reflect.get(target, key, receiver);
			track(target, key);
			return result;
		},
		set(target, key, value, receiver) {
			const oldValue = target[key];
			const result = Reflect.set(target, key, value, receiver);
			if (result && oldValue !== value) {
				trigger(target, key);
			}
			return result;
		},
	};
	return new Proxy(target, handler);
}

//eff(コールバック関数)を受け取り、activeEffectとして実行して、最後にnullでリセットする
function effect(eff) {
	activeEffect = eff;
	activeEffect();
	activeEffect = null;
}

const product = reactive({ price: 5, quantity: 2 });
let taxRate = reactive(new Number(10 / 100));
let salePrice = 0;
let total = 0;

effect(() => {
	total = product.price * product.quantity;
});
effect(() => {
	salePrice = product.price * 0.9 * (1 + taxRate);
});

product.quantity = 3;
console.log(total); //15が出力
console.log(salePrice); //4.5が出力

product.price = 10;
console.log(total); //30が出力
console.log(salePrice); //9が出力

taxRate = 20 / 100;
console.log(salePrice); //12が出力

console.log(product);
