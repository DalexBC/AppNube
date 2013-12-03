function numberValidator(evt){
	var theEvent = evt || window.event;
	var key = theEvent.keyCode || theEvent.which;
	key = String.fromCharCode( key );
	var regex = /[a-zA-Z]|\./;
	if( regex.test(key) ) {
		theEvent.returnValue = false;
		if(theEvent.preventDefault) theEvent.preventDefault();
	}
}

function goToGraph(){
	var cp = document.getElementById('indexCP').value;
    
    var mesVal = document.getElementById('indexMes').value;
	var mes = mesVal.substring(0, mesVal.indexOf('-'));
    var mesText = mesVal.substring(mesVal.indexOf('-') + 1, mesVal.length);

    var giroVal = document.getElementById('indexGiro').value;
	var giro = giroVal.substring(0, giroVal.indexOf('-'));
    var giroText = giroVal.substring(giroVal.indexOf('-') + 1, giroVal.length);
	
	if(cp == '' || mes == '' || giro == ''){
		alert('Todos los campos son necesarios, favor de llenarlos')
	}
	else if(cp.length != 5){
		alert('El codigo postal debe tener 5 digitos');
	}
    else if(!(cp.substring(0,2) == '28' || cp.substring(0,2) == '08')){
        alert('El codigo postal debe empezar con 28 (Madrid) o 08 (Barcelona)');
    }
	else{
		var destination = '/grafica?cp='+cp+'&mes='+mes+'&giro='+giro+'&mesText='+mesText+'&giroText='+giroText;
        window.location = destination;
	}
}