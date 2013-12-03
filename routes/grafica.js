/*
 * GET users listing.
 */
var http=require('https');
var result1;
var result2;
var result3;
var finalJSON;

exports.grafica = function(req, res){
    result1='';
    result2='';
    result3='';
    finalJSON='';

    var query1 = { //query de los consumos por dia y datos estadisticos
        host: 'api.bbva.com',
        port: 443,
        headers:{
            'Authorization': 'R3JhZmljYXNCQlZBOjMwZTMxNjEzMWE0OGEzZDAwOTViYzYzZjcxOTNkMjNjYTY0MDBlYTU='
        },
        path: '/apidatos/zones/consumption_pattern.json?date_min='+req.query.mes+'&date_max='+req.query.mes+'&group_by=month&category='+req.query.giro+'&zipcode='+req.query.cp
    };
   
    var query2 = { //query de los consumos divididos por grupos demograficos
        host: 'api.bbva.com',
        port: 443,
        headers:{
            'Authorization': 'R3JhZmljYXNCQlZBOjMwZTMxNjEzMWE0OGEzZDAwOTViYzYzZjcxOTNkMjNjYTY0MDBlYTU='
        },
        path: '/apidatos/zones/cards_cube.json?date_min='+req.query.mes+'&date_max='+req.query.mes+'&group_by=month&category='+req.query.giro+'&zipcode='+req.query.cp
    };

    var query3 = { //query de los codigos postales
        host: 'api.bbva.com',
        port: 443,
        headers:{
            'Authorization': 'R3JhZmljYXNCQlZBOjMwZTMxNjEzMWE0OGEzZDAwOTViYzYzZjcxOTNkMjNjYTY0MDBlYTU='
        },
        path: '/apidatos/zones/customer_zipcodes.json?date_min='+req.query.mes+'&date_max='+req.query.mes+'&group_by=month&category='+req.query.giro+'&zipcode='+req.query.cp+'&by=incomes'
    };

    http.get(query1, function(res1) {
        res1.on("data", function (chunk1) {
            result1+=chunk1; //va concatenando la respuesta        
        });
        res1.on("end", function(){
            try{
            var resultado = JSON.parse(result1);
            //accesar una variable que indique que el JSON si fue valido para los campos admitidos
            try{
                var prueba = resultado.data.stats[0].days[0].avg
            }
            catch(e){
                var datos = "{'status':'error'}";
                var ret = {'objeto': datos};
                console.log(e.message);
                res.render("grafica", ret);
                return;
            }

            var media = 0;
            var min = 999999999; //numero muy grande cualquiera
            var max = -1;   //numero muy pequenho cualquiera
            var numPagos = 0;
            for(var i=0;i<7;i++){
                try{
                    media += (resultado.data.stats[0].days[i].avg / 7);
               
                    if(resultado.data.stats[0].days[i].min < min)
                        min = resultado.data.stats[0].days[i].min;

                    if(resultado.data.stats[0].days[i].max > max)
                        max = resultado.data.stats[0].days[i].max;

                    numPagos += resultado.data.stats[0].days[i].num_payments;
                }
                catch(e){
                    break;
                }
            }

            finalJSON = "{ 'status': 'ok'," +
                            "'query1': {" +
                            "'giro': '"      + req.query.giroText       + "'," +
                            "'mes': '"       + req.query.mesText        + "'," +
                            "'cp': '"        + req.query.cp             + "'," +
                            "'media': '"     + media                    + "'," +
                            "'min': '"       + min                      + "'," +
                            "'max': '"       + max                      + "'," +
                            "'num_pagos': '" + numPagos                 + "'," +
                           
                            "'grafica1': [" +
                                "['Dias', 'Ventas'],";
                           
                            //algunos negocios no abren en domingos
                            try{
                                var temp = "['D', " + resultado.data.stats[0].days[6].avg * resultado.data.stats[0].days[6].num_payments + "],";
                                finalJSON += temp;
                            }
                            catch(e){
                                var temp = "['D', 0],";
                                finalJSON += temp;
                            }

                                finalJSON +=    ("['L', " + resultado.data.stats[0].days[0].avg * resultado.data.stats[0].days[0].num_payments + "]," +
                                                "['M', " + resultado.data.stats[0].days[1].avg * resultado.data.stats[0].days[1].num_payments + "]," +
                                                "['M', " + resultado.data.stats[0].days[2].avg * resultado.data.stats[0].days[2].num_payments + "]," +
                                                "['J', " + resultado.data.stats[0].days[3].avg * resultado.data.stats[0].days[3].num_payments + "]," +
                                                "['V', " + resultado.data.stats[0].days[4].avg * resultado.data.stats[0].days[4].num_payments + "]");
                            try{
                                var temp =     ",['S', " + resultado.data.stats[0].days[5].avg * resultado.data.stats[0].days[5].num_payments + "]]},";
                                finalJSON += temp;
                            }
                            catch(e){
                                var temp =     ",['S', 0]]},";
                                finalJSON += temp;
                            }

            http.get(query2, function(res2) {
                res2.on("data", function (chunk2) {
                    result2+=chunk2; //va concatenando la respuesta        
                });
                res2.on("end", function(){
                    var resultado2 = JSON.parse(result2);
                   
                    finalJSON += ("'query2': {" +
                                        "'grafica2': ["+
                                            "['Cliente', 'Monto'],");
                  
                    for(var i=0; ; i++){
                        try{
                            var hash = resultado2.data.stats[0].cube[i].hash;
                            var pagos = resultado2.data.stats[0].cube[i].num_payments * resultado2.data.stats[0].cube[i].avg;
                            var entidad = "";

                            switch(hash){
                                case "E#U": entidad = "Corporaciones";      break;
                               
                                case "F#0": entidad = "F menores de 19";    break;
                                case "F#1": entidad = "F 19-25";            break;
                                case "F#2": entidad = "F 26-35";            break;
                                case "F#3": entidad = "F 36-45";            break;
                                case "F#4": entidad = "F 46-55";            break;
                                case "F#5": entidad = "F 56-65";            break;
                                case "F#6": entidad = "F mayores a 65";     break;
                                case "F#U": entidad = "F edad desconocida"; break;

                                case "M#0": entidad = "M menores de 19";    break;
                                case "M#1": entidad = "M 19-25";            break;
                                case "M#2": entidad = "M 26-35";            break;
                                case "M#3": entidad = "M 36-45";            break;
                                case "M#4": entidad = "M 46-55";            break;
                                case "M#5": entidad = "M 56-65";            break;
                                case "M#6": entidad = "M mayores a 65";     break;
                                case "M#U": entidad = "M edad desconocida"; break;

                                case "U#0": entidad = "Sexo desconocido menores de 19";    break;
                                case "U#1": entidad = "Sexo desconocido 19-25";            break;
                                case "U#2": entidad = "Sexo desconocido 26-35";            break;
                                case "U#3": entidad = "Sexo desconocido 36-45";            break;
                                case "U#4": entidad = "Sexo desconocido 46-55";            break;
                                case "U#5": entidad = "Sexo desconocido 56-65";            break;
                                case "U#6": entidad = "Sexo desconocido mayores a 65";     break;
                                case "U#U": entidad = "Sexo desconocido edad desconocida"; break;
                            }
                           
                            //si es la primera iteracion no lleva coma al inicio
                            if(i==0)
                                finalJSON += ("['"+entidad+"', "+pagos+"]");
                            else
                                finalJSON += (",['"+entidad+"', "+pagos+"]");

                        }
                        catch(e){
                            break;
                        }
                    }
                   
                    finalJSON += ("]},");

                    http.get(query3, function(res3) {
                        res3.on("data", function (chunk3) {
                            result3+=chunk3; //va concatenando la respuesta        
                        });
                        res3.on("end", function(){
                            var resultado3 = JSON.parse(result3);
                           
                            finalJSON += ("'query3': {" +
                                            "'grafica3': ["  );

                            //solo mostrara los 20 zipcodes mas relevantes
                            for(var i =0; i < 20 ; i++){
                                try{
                                    var zipcode =   resultado3.data.stats[0].zipcodes[i].label;
                                    var gasto   =   resultado3.data.stats[0].zipcodes[i].incomes;
                                    var pagos   =   resultado3.data.stats[0].zipcodes[i].num_payments;
                                    var tarjetas=   resultado3.data.stats[0].zipcodes[i].num_cards;
                                   
                                    if(i==0)
                                        finalJSON += "['"+zipcode+"', {v:"+gasto+", f: '$"+gasto+"' }, "+pagos+", "+tarjetas+"]";
                                    else
                                        finalJSON += ",['"+zipcode+"', {v:"+gasto+", f: '$"+gasto+"' }, "+pagos+", "+tarjetas+"]";
                                }
                                catch(e){
                                    console.log(e.message);
                                    break;
                                }
                            }

                            finalJSON += ("]}}");

                            //Procesamiento finalizado, pasando a fase de renderizado
                            var grafica = {'objeto':finalJSON};
                            console.log(grafica);
                            res.render('grafica', grafica);

                        });

                    }).on("error", function(ix){
                        console.log('Got error: ' + ix.message);   
                    });
                });
          
            }).on("error", function(ex){
                console.log('Got error: ' +ex.message);   
            });
           
           
        }
        catch(e){
            console.log(e.message);
        }});

    }).on("error", function(ax) {
        console.log('Got error: ' + ax.message);
    });
};


