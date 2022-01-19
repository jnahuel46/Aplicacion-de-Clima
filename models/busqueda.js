const fs = require('fs');
const axios = require('axios');



class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor() {
        // leer bd si existe 
        this.leerDb();
    };

    get historialCapitalizado() {// capializar la primera letra de cada palabra(ciudad)
        return this.historial.map(lugar => { //recorro el historial como lugar

            let palabras = lugar.split(' ');//divido cada lugar donde haya un espacio y lo almaceno en palabras

            palabras = palabras.map(palabra => //vuevlo a recorrer el arreglo esta vez por "palabra" como un arreglo
                palabra[0].toUpperCase() + palabra.substring(1)// a la primer letra del arreglo "palabra" la capitalizo
            )

            return palabras.join(' ');// vuelvo a unir donde habia espacio
        })
    };

    get paramsMapbox() {
        return {
            "limit": 5,
            "language": "es",
            "access_token": process.env.MAPBOX_KEY || '' //utilizo en el dotenv para crear un parametro global seguro y llamarlo mediante el procces.env
        }
    };

    async buscarCiudades(palabraDeBusqueda = '') {


        try {
            //peticion http

            const instance = axios.create({
                baseURL: `https://api.mapbox.com`,
                params: this.paramsMapbox// retorno los parametrod del objeto paramsMapbox mediante el get
            });

            const resp = await instance.get(`/geocoding/v5/mapbox.places/${palabraDeBusqueda}.json`);

            return resp.data.features.map(lugar => ({//retorna los lugares que coincidan con la busqueda de lugar y les hago un map para generar un nuevo array con otro formato
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }));

        } catch (error) {
            return [];
        }

    };

    async climaCiudad(lat, lon) {

        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org`,
                params: {
                    'appid': 'aeb2fa77b7ade2d666909bfdd2215052',
                    'units': 'metric',
                    'lang': 'es'
                }

            });

            const resp = await instance.get(`/data/2.5/weather?lat=${lat}&lon=${lon}`);
            const { weather, main } = resp.data;// recibo la data y desestructuro lo que necesito, es una forma corta de hacerlo;

            return {
                desc: weather[0].description,// weather es un arreglo y por lo tanto voy a la primera posicion(unica)
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp,
            };

        } catch (error) {
            console.log(error);
        }

    };

    agregarHistorial(lugar = '') {

        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return; //validamos que no se repita el mismo elemento en el array
        }

        this.historial = this.historial.splice(0, 7);// Mantengo solo 7 posiciones del array para que no sea tan grande
        this.historial.unshift(lugar.toLocaleLowerCase());//aca tomo el array historial y le añado un nuevo elemento al inicio, tambien podria ser con un .push(al final)

        //grabar db
        this.guardarDb();
    }

    guardarDb() {
        const payload = {
            historial: this.historial
        };
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDb() {
        if (!fs.existsSync(this.dbPath)) {
            return null;
        }

        const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });// el encoding es para que no me lo lea en bites
        const data = JSON.parse(info);
        this.historial = data.historial;

    }


};

module.exports = Busquedas;



