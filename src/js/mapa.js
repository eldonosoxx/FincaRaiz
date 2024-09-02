(function() {
    const lat = document.querySelector('#lat').value || 4.8367424;  //se valida si el campo "tiempo", "valores", en caso contrario coloca latitud por defecto.
    const lng = document.querySelector('#lng').value || -75.6808774;
    const mapa = L.map('mapa').setView([lat, lng ], 13);
    let marker;
    
    //Utilizar Provider y Geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();//permite obtener la direción de la clle


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

     //Pin para poder dar la ubicación y poder mover
      marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true  //mueve el pin y se mueve el mapa
        })
        .addTo(mapa)

        //detectar moviemiento del Pin para leer latitud y longitud
    marker.on('moveend', function(e){
        marker = e.target
        const posicion = marker.getLatLng();
            mapa.panTo(new L.LatLng(posicion.lat, posicion.lng)) //panTo-permite centrar la posición en el mapa
    //obtener la información de las calles donde se suelte el Pin
    geocodeService.reverse().latlng(posicion, 13).run(function(error, resultado) {
    //console.log(resultado)
    marker.bindPopup(resultado.address.LongLabel) //imprime en el globo toda la información

    //llenar los campos para luego almacenarlos en la BF.
    document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
    document.querySelector('#calle').value = resultado?.address?.Address ?? '';
    document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
    document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';

        })
    })           

})()