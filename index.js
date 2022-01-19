require('dotenv').config();
const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const inquirer = require('inquirer');
const Busquedas = require("./models/busqueda");
require('colors');


const main = async () => {

    const busquedas = new Busquedas();

    let opt = '';

    do {
        opt = await inquirerMenu();// aca se imprime el menu
        switch (opt) {

            case 1:
                //Mostar mensaje
                const palabraDeBusqueda = await leerInput('Ciudad: ');

                //Buscar los lugares
                const lugares = await busquedas.buscarCiudades(palabraDeBusqueda);//me retorna lugares en plural porque el map de trae un arr de lugares con cada item de lugar

                //Seleccione el lugar 
                const id = await listarLugares(lugares);
                if (id === '0') {
                    continue;// si tocamos al boton cero, que continue a la proxima iteracion
                }
                
                const lugarSel = lugares.find(l => l.id === id);
                busquedas.agregarHistorial(lugarSel.nombre);


                //Clima

                const clima = await busquedas.climaCiudad(lugarSel.lat, lugarSel.lng);
                
                //console.log(clima);
                //Mostrar resultados
                console.clear();
                console.log('\n Informacion de la ciudad \n'.green);
                console.log('Ciudad: ', lugarSel.nombre.yellow);
                console.log('Lat: ', lugarSel.lat);
                console.log('Lng: ', lugarSel.lng);
                console.log('Temperatura: ',clima.temp );
                console.log('Minima: ',clima.min );
                console.log('Maxima: ', clima.max );
                console.log('Como esta el clima?: ', clima.desc.yellow );


                break;

            case 2:// tenemos que mostrar el historial
                busquedas.historialCapitalizado.forEach((lugar, i) => {
                    const idx = `${i + 1}`.green;
                    console.log(`${idx} ${lugar}`);
                });
                
                break;

            case 0:

                break;

        }



        if (opt !== 0) {
            await pausa();
        }

    } while (opt !== 0);


};

main();