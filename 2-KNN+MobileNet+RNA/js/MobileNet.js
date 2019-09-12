$('#resultado').html('&nbsp;');
$('#arquivos').html('');

function abrir() {
	let exibicao = document.querySelector('#exibicao');
	let captura = document.querySelector('#captura');
	let file = document.querySelector('input[type=file]').files[0];
	let reader = new FileReader();

	if(file) {
		reader.readAsDataURL(file);
		let arquivos = $('#arquivos').html().toString().trim();
		if(arquivos.indexOf('%') < 0) {
			if(arquivos.length > 0)
				$('#arquivos').html(arquivos+', '+file.name);
			else
				$('#arquivos').html(file.name);
		}
	}else {
		exibicao.src = './img/TensorFlow.png';
		captura.src = './img/TensorFlow.png';
	}

	reader.onloadend = function() {
		exibicao.src = reader.result;
		captura.src = reader.result;
	}
	$('#resultado').text('...');
}

function prever() {
	$('#resultado').text('... processando classificação.');
	$('#classe').val('...');
	$('#arquivos').text('...');

	const img = document.getElementById('captura');
	mobilenet.load().then(model => {
		model.classify(img).then(json => {
			let percent1 = parseFloat(json[0].probability*100).toFixed(4);
			let percent2 = parseFloat(json[1].probability*100).toFixed(4);
			let percent3 = parseFloat(json[2].probability*100).toFixed(4);

			let txt = '';
			txt += `${percent1}% de probabilidades de pertencer a classe ${json[0].className}.\r\n`;
			txt += `${percent2}% de probabilidades de pertencer a classe ${json[1].className}.\r\n`;
			txt += `${percent3}% de probabilidades de pertencer a classe ${json[2].className}.\r\n`;
			$('#arquivos').html(txt);
			$('#resultado').
			html(`<b><span class='text-danger'>${json[0].className.toUpperCase()}</span></b>`);
		});
	});
}
