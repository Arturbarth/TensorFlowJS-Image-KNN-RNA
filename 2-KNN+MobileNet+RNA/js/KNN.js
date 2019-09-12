let classificacoes = [];

$('#resultado').html('&nbsp;');
$('#classe').val('');
$('#arquivos').html('');

function abrir() {
	let preview = document.querySelector('#imagem');
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
		preview.src = '';
	}

	reader.onloadend = function () {
		preview.src = reader.result;
	}
	$('#resultado').text('...');
}

function classificar() {
	$('#resultado').text('... classificando.');
	let className = $('#classe').val().trim();
	if (className.length <= 0) className = 'Classe INDEFINIDA';

	const img = document.getElementById('imagem');
	const arrPixels = tf.browser.fromPixels(img).arraySync();

	const objClasse = { Class: className, Pixels: arrPixels };
	classificacoes.push(objClasse);
    
	const resultado =
		`<b><span class='text-white'>CLASSIFICADO como </span></b><b><span class='text-danger'>${className.toUpperCase()}</span></b>`;
	$('#resultado').html(resultado);
}

function prever() {
	$('#resultado').text('... processando predição.');
	$('#classe').val('...');
	$('#arquivos').text('...');

	const img = document.getElementById('imagem');
	const tfPixels1 = tf.browser.fromPixels(img);

	let arrDiferencas = [];
	let arrClassName = [];
	for (let i = 0; i < classificacoes.length; i++) {
		const className = classificacoes[i].Class.trim();
		const tfPixels2 = tf.tensor(classificacoes[i].Pixels);

		const diferenca = tfPixels1.sub(tfPixels2).abs().sum().arraySync();
		arrClassName.push(className);
		arrDiferencas.push(diferenca);
	}

	const menor = tf.tensor(arrDiferencas).min().arraySync();
	const maior = tf.tensor(arrDiferencas).max().arraySync();
	const percentPositivo = parseFloat(100 - ((menor / (menor + maior)) * 100)).toFixed(8);
	const percentNegativo = parseFloat(100 - percentPositivo).toFixed(8);
	let index = 0;
	for (let i = 0; i < arrDiferencas.length; i++) {
		if (arrDiferencas[i] == menor) index = i;
	}

	const classificacao = arrClassName[index].toString().trim();
	$('#resultado').html(`<b><span class='text-danger'>${classificacao.toUpperCase()}</span></b>`);
	$('#classe').val(classificacao);

	const probabilidades =
		`${percentPositivo}% de probabilidades de pertencer a classe ${classificacao}.\r\n` +
		`${percentNegativo}% de probabilidades de pertencer a outras classes.`;
	$('#arquivos').html(probabilidades);
}
