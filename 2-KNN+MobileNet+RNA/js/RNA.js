$('#resultado').html('&nbsp;');
$('#classe').val('');
$('#arquivos').html('');

let model = null;
let X = [];
let Y = [];
let classesNomes = [];

function abrir() {
	let exibicao = document.querySelector('#exibicao');
	let captura = document.querySelector('#captura');
	let file = document.querySelector('input[type=file]').files[0];
	let reader = new FileReader();

	if (file) {
		reader.readAsDataURL(file);
		let arquivos = $('#arquivos').html().toString().trim();
		if (arquivos.indexOf('%') < 0) {
			if (arquivos.length > 0)
				$('#arquivos').html(arquivos + ', ' + file.name);
			else
				$('#arquivos').html(file.name);

			if (file.name.toString().indexOf('Coca') >= 0) $('#classe').val('Coca-Cola');
			else if (file.name.toString().indexOf('Sprite') >= 0) $('#classe').val('Sprite');
		}
	} else {
		exibicao.src = './img/TensorFlow.png';
		captura.src = './img/TensorFlow.png';
	}

	reader.onloadend = function () {
		exibicao.src = reader.result;
		captura.src = reader.result;
	}
	$('#resultado').text('...');
}

function formatMatrix(arr) {
	let result = [];
	for (let i = 0; i < arr.length; i++) {
		let temp = arr[i];
		for (j = 0; j < 3; j++) {
			result.push(temp[j]);
		}
	}
	return result;
}

function diminuir(arr) {
	if (arr.length > 0) {
		let result = [];
		for (let i = 0; i < arr.length; i++) {
			result.push(Number(parseFloat(arr[i] / 1000).toFixed(3)));
		}
		return result;
	} else {
		return [];
	}
}

function toNumberClass(strClass = '') {
	let index = 0;
	for (let i = 0; i < classesNomes.length; i++) {
		if (classesNomes[i].trim() == strClass.trim()) {
			index = i;
		}
	}
	return Number(index);
}

function toStringClass(numberClass = 0) {
	numberClass = Number(parseFloat(numberClass[0]).toFixed(0));
	if (numberClass > (classesNomes.length - 1)) numberClass = Number(classesNomes.length - 1);
	let name = '';
	for (let i = 0; i < classesNomes.length; i++) {
		if (i == numberClass) {
			name = classesNomes[i].trim();
		}
	}
	return name;
}

function toArrayNumberClass(arrClass) {
	let result = [];
	for (let i = 0; i < arrClass.length; i++) {
		result.push(toNumberClass(arrClass[i]));
	}
	return result;
}

function classificar() {
	$('#resultado').text('... classificando.');
	let className = $('#classe').val().trim();
	if (className.length <= 0) className = 'Classe INDEFINIDA';

	const img = document.getElementById('captura');
	let arrPixels = tf.browser.
		fromPixels(img).
		resizeNearestNeighbor([1, 200]).
		reshape([200, 3]).
		arraySync();
	arrPixels = formatMatrix(arrPixels);
	arrPixels = diminuir(arrPixels);

	X.push(arrPixels);
	Y.push(className);

	classesNomes = [... new Set(Y)];

	const resultado =
		`<b><span class='text-white'>CLASSIFICADO como </span></b><b><span class='text-danger'>${className.toUpperCase()}</span></b>`;
	$('#resultado').html(resultado);
}

async function treinar() {
	$('#resultado').text('... processando treinamento.');
	$('#classe').val('...');
	$('#arquivos').text('...');

	let tfx = tf.tensor(X);
	if (typeof (Y[0]) == 'string')
		Y = toArrayNumberClass(Y);
	let tfy = tf.tensor(Y, [Y.length, 1]);

	model = tf.sequential();
	
	model.add(tf.layers.dense({inputShape: [600], units: 400, activation: 'sigmoid', kernelInitializer: 'truncatedNormal', useBias: true}));
	model.add(tf.layers.dense({inputShape: [400], units: 200, activation: 'sigmoid', useBias: true}));
	model.add(tf.layers.dense({inputShape: [200], units: 100, activation: 'sigmoid', useBias: true}));
	model.add(tf.layers.dense({inputShape: [100], units: 50, activation: 'sigmoid', useBias: true}));
	model.add(tf.layers.dense({inputShape: [50], units: 25, activation: 'sigmoid', useBias: true}));
	model.add(tf.layers.dense({inputShape: [25], units: 1, activation: 'sigmoid', useBias: true}));

	model.compile({
		optimizer: tf.train.adam(),
		loss: 'meanSquaredError'
	});

	let epc = 2000;
	for (let i = 1; i <= epc; i++) {
		let train = await model.fit(tfx, tfy, epochs = 2000);
		let erro = parseFloat(train.history.loss[0]).toFixed(4);
		console.log(`${i.toString().padEnd(5, ' ')} - taxa de erro: ${erro}`);
		if (erro == 0) i = epc + 1;
	}

	$('#resultado').text('treinamento concluído com sucesso.');
	$('#classe').val('');
	$('#arquivos').text('');
}

function prever() {
	$('#resultado').text('... processando predição.');
	$('#classe').val('...');
	$('#arquivos').text('...');

	const img = document.getElementById('captura');
	let arrInput = tf.browser.
		fromPixels(img).
		resizeNearestNeighbor([1, 200]).
		reshape([200, 3]).
		arraySync();
	arrInput = formatMatrix(arrInput);
	arrInput = diminuir(arrInput);
	const tfInput = tf.tensor([arrInput]);

	let output = model.predict(tfInput).round().arraySync();

	let numero = Number(output[0]);
	let percentPositivo = 0;
	if (numero < 0.5) percentPositivo = (1 - numero) * 100; else percentPositivo = numero * 100;
	percentPositivo = parseFloat(percentPositivo).toFixed(8);
	percentNegativo = parseFloat(100 - percentPositivo).toFixed(8);

	const classificacao = toStringClass(output);
	$('#resultado').html(`<b><span class='text-danger'>${classificacao.toUpperCase()}</span></b>`);
	$('#classe').val(classificacao);

	const probabilidades =
		`Essa imagem é uma ${classificacao}.\r\n`;
	$('#arquivos').html(probabilidades);
}
