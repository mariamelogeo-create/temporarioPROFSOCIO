
        var map = L.map('map', {
            zoomControl:false, maxZoom:28, minZoom:1
        }).fitBounds([[-33.96563166238528,-78.69858320343212],[8.823887704085486,-13.19124963334491]]);
        var hash = new L.Hash(map);
        map.attributionControl.setPrefix('<a href="https://github.com/qgis2web/qgis2web" target="_blank">qgis2web</a> &middot; <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> &middot; <a href="https://qgis.org">QGIS</a>');
        var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});
        // ===== Fluxos personalizados =====
        function flowVisual(n){n=Number(n||0);if(n<=30)return{color:'#fdae61',weight:1.5};if(n<=60)return{color:'#f46d43',weight:2.4};if(n<=100)return{color:'#d73027',weight:3.4};return{color:'#7f0000',weight:4.8};}
        function curvePts(a,b,bend){var x1=a[1],y1=a[0],x2=b[1],y2=b[0],mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)||1,off=len*bend,cx=mx-(dy/len)*off,cy=my+(dx/len)*off,out=[];for(var i=0;i<=32;i++){var t=i/32,u=1-t;out.push([u*u*y1+2*u*t*cy+t*t*y2,u*u*x1+2*u*t*cx+t*t*x2]);}return out;}
        function bearing(a,b){var la1=a[0]*Math.PI/180,la2=b[0]*Math.PI/180,dl=(b[1]-a[1])*Math.PI/180,y=Math.sin(dl)*Math.cos(la2),x=Math.cos(la1)*Math.sin(la2)-Math.sin(la1)*Math.cos(la2)*Math.cos(dl);return( Math.atan2(y,x)*180/Math.PI+360)%360;}
        function createCurvedFlowLayer(gj,pane,pop){var g=L.layerGroup();(gj.features||[]).forEach(function(f){var geom=f.geometry;if(!geom)return;var lines=geom.type==='MultiLineString'?geom.coordinates:(geom.type==='LineString'?[geom.coordinates]:[]);lines.forEach(function(c){if(!c||c.length<2)return;var a=[c[0][1],c[0][0]],z=c[c.length-1],b=[z[1],z[0]],pts=curvePts(a,b,-0.18),v=flowVisual(f.properties.N_INSCRICO),ln=L.polyline(pts,{pane:pane,color:v.color,weight:v.weight,opacity:.9,lineCap:'round',lineJoin:'round',interactive:true});pop(f,ln);ln.addTo(g);var pa=pts[pts.length-2],pb=pts[pts.length-1],ang=bearing(pa,pb)-90,ic=L.divIcon({className:'flow-arrow-icon',html:'<div class="flow-arrow-triangle" style="color:'+v.color+';transform:rotate('+ang+'deg)"></div>',iconSize:[14,14],iconAnchor:[7,5]});L.marker(b,{pane:pane,icon:ic,interactive:false}).addTo(g);});});return g;}

        // remove popup's row if "visible-with-data"
        function removeEmptyRowsFromPopupContent(content, feature) {
         var tempDiv = document.createElement('div');
         tempDiv.innerHTML = content;
         var rows = tempDiv.querySelectorAll('tr');
         for (var i = 0; i < rows.length; i++) {
             var td = rows[i].querySelector('td.visible-with-data');
             var key = td ? td.id : '';
             if (td && td.classList.contains('visible-with-data') && feature.properties[key] == null) {
                 rows[i].parentNode.removeChild(rows[i]);
             }
         }
         return tempDiv.innerHTML;
        }
        // modify popup if contains media
        function addClassToPopupIfMedia(content, popup) {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            var imgTd = tempDiv.querySelector('td img');
            if (imgTd) {
                var src = imgTd.getAttribute('src');
                if (/\.(jpg|jpeg|png|gif|bmp|webp|avif)$/i.test(src)) {
                    popup._contentNode.classList.add('media');
                    var img = popup._contentNode.querySelector('td img');
                    if (img) {
                        // If already loaded (cache), update immediately
                        if (img.complete && img.naturalHeight > 0) {
                            popup.update();
                        } else {
                            img.addEventListener('load', function() {
                                popup.update();
                            });
                            img.addEventListener('error', function() {
                                popup.update();
                            });
                        }
                    }
                } else if (/\.(mp3|wav|ogg|aac)$/i.test(src)) {
                    var audio = document.createElement('audio');
                    audio.controls = true;
                    audio.src = src;
                    imgTd.parentNode.replaceChild(audio, imgTd);
                    popup._contentNode.classList.add('media');
                    setTimeout(function() {
                        popup.setContent(tempDiv.innerHTML);
                        popup.update();
                    }, 10);
                } else if (/\.(mp4|webm|ogg|mov)$/i.test(src)) {
                    var video = document.createElement('video');
                    video.controls = true;
                    video.src = src;
                    video.style.width = "400px";
                    video.style.height = "300px";
                    video.style.maxHeight = "60vh";
                    video.style.maxWidth = "60vw";
                    imgTd.parentNode.replaceChild(video, imgTd);
                    popup._contentNode.classList.add('media');
                    // Aggiorna il popup quando il video carica i metadati
                    video.addEventListener('loadedmetadata', function() {
                        popup.update();
                    });
                    setTimeout(function() {
                        popup.setContent(tempDiv.innerHTML);
                        popup.update();
                    }, 10);
                } else {
                    popup._contentNode.classList.remove('media');
                }
            } else {
                popup._contentNode.classList.remove('media');
            }
        }
        var zoomControl = L.control.zoom({
            position: 'topleft'
        }).addTo(map);
        var bounds_group = new L.featureGroup([]);
        function setBounds() {
        }
        map.createPane('pane_ESRIGraylight_0');
        map.getPane('pane_ESRIGraylight_0').style.zIndex = 400;
        var layer_ESRIGraylight_0 = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
            pane: 'pane_ESRIGraylight_0',
            opacity: 1.0,
            attribution: '',
            minZoom: 1,
            maxZoom: 28,
            minNativeZoom: 0,
            maxNativeZoom: 20
        });
        layer_ESRIGraylight_0;
        map.addLayer(layer_ESRIGraylight_0);
        function pop_LimitesdasUFs_1(feature, layer) {
            var popupContent = '<table>\
                    <tr>\
                        <th scope="row">UF</th>\
                        <td>' + (feature.properties['NM_UF'] !== null ? autolinker.link(String(feature.properties['NM_UF']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">UF de origem</th>\
                        <td>' + (feature.properties['SIGLA_UF'] !== null ? autolinker.link(String(feature.properties['SIGLA_UF']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                </table>';
            var content = removeEmptyRowsFromPopupContent(popupContent, feature);
			layer.on('popupopen', function(e) {
				addClassToPopupIfMedia(content, e.popup);
			});
			layer.bindPopup(content, { maxHeight: 400 });
        }

        function style_LimitesdasUFs_1_0() {
            return {
                pane: 'pane_LimitesdasUFs_1',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(166,206,227,0.6078431372549019)',
                interactive: true,
            }
        }
        map.createPane('pane_LimitesdasUFs_1');
        map.getPane('pane_LimitesdasUFs_1').style.zIndex = 401;
        map.getPane('pane_LimitesdasUFs_1').style['mix-blend-mode'] = 'normal';
        var layer_LimitesdasUFs_1 = new L.geoJson(json_LimitesdasUFs_1, {
            attribution: '',
            interactive: true,
            dataVar: 'json_LimitesdasUFs_1',
            layerName: 'layer_LimitesdasUFs_1',
            pane: 'pane_LimitesdasUFs_1',
            onEachFeature: pop_LimitesdasUFs_1,
            style: style_LimitesdasUFs_1_0,
        });
        bounds_group.addLayer(layer_LimitesdasUFs_1);
        map.addLayer(layer_LimitesdasUFs_1);
        function pop_FluxodeInscritosN_2(feature, layer) {
            var popupContent = '<table>\
                    <tr>\
                        <th scope="row">Ano</th>\
                        <td>' + (feature.properties['ANO'] !== null ? autolinker.link(String(feature.properties['ANO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">UF de origem</th>\
                        <td>' + (feature.properties['SIGLA_UF'] !== null ? autolinker.link(String(feature.properties['SIGLA_UF']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Associada</th>\
                        <td>' + (feature.properties['ASSOCIADA'] !== null ? autolinker.link(String(feature.properties['ASSOCIADA']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                </table>';
            var content = removeEmptyRowsFromPopupContent(popupContent, feature);
			layer.on('popupopen', function(e) {
				addClassToPopupIfMedia(content, e.popup);
			});
			layer.bindPopup(content, { maxHeight: 400 });
        }

        function style_FluxodeInscritosN_2_0(feature) {
            if (feature.properties['N_INSCRICO'] >= 1.000000 && feature.properties['N_INSCRICO'] <= 30.000000 ) {
                return {
                pane: 'pane_FluxodeInscritosN_2',
                interactive: true,
            }
            }
            if (feature.properties['N_INSCRICO'] >= 30.010000 && feature.properties['N_INSCRICO'] <= 60.000000 ) {
                return {
                pane: 'pane_FluxodeInscritosN_2',
                interactive: true,
            }
            }
            if (feature.properties['N_INSCRICO'] >= 60.010000 && feature.properties['N_INSCRICO'] <= 100.000000 ) {
                return {
                pane: 'pane_FluxodeInscritosN_2',
                interactive: true,
            }
            }
            if (feature.properties['N_INSCRICO'] >= 100.010000 && feature.properties['N_INSCRICO'] <= 300.000000 ) {
                return {
                pane: 'pane_FluxodeInscritosN_2',
                interactive: true,
            }
            }
        }
        map.createPane('pane_FluxodeInscritosN_2');
        map.getPane('pane_FluxodeInscritosN_2').style.zIndex = 402;
        map.getPane('pane_FluxodeInscritosN_2').style['mix-blend-mode'] = 'normal';
        var layer_FluxodeInscritosN_2 = createCurvedFlowLayer(json_FluxodeInscritosN_2, 'pane_FluxodeInscritosN_2', pop_FluxodeInscritosN_2);
        bounds_group.addLayer(layer_FluxodeInscritosN_2);
        function pop_SededaAssociada_3(feature, layer) {
            var popupContent = '<table>\
                    <tr>\
                        <th scope="row">Ano</th>\
                        <td>' + (feature.properties['ANO'] !== null ? autolinker.link(String(feature.properties['ANO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Associada</th>\
                        <td>' + (feature.properties['ASSOCIADA'] !== null ? autolinker.link(String(feature.properties['ASSOCIADA']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Latitude da associada</th>\
                        <td>' + (feature.properties['LAT_ASS'] !== null ? autolinker.link(String(feature.properties['LAT_ASS']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Longitude da associada</th>\
                        <td>' + (feature.properties['LONG_ASS'] !== null ? autolinker.link(String(feature.properties['LONG_ASS']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Nº de inscritos</th>\
                        <td>' + (feature.properties['N_INSCRICO'] !== null ? autolinker.link(String(feature.properties['N_INSCRICO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                </table>';
            var content = removeEmptyRowsFromPopupContent(popupContent, feature);
			layer.on('popupopen', function(e) {
				addClassToPopupIfMedia(content, e.popup);
			});
			layer.bindPopup(content, { maxHeight: 400 });
        }

        function style_SededaAssociada_3_0() {
            return {
                pane: 'pane_SededaAssociada_3',
                radius: 6.4,
                opacity: 1,
                color: 'rgba(0,0,0,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(255,255,255,1.0)',
                interactive: true,
            }
        }
        function style_SededaAssociada_3_1() {
            return {
                pane: 'pane_SededaAssociada_3',
                radius: 1.4,
                opacity: 1,
                color: 'rgba(0,0,0,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 2.0,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(0,0,0,1.0)',
                interactive: true,
            }
        }
        map.createPane('pane_SededaAssociada_3');
        map.getPane('pane_SededaAssociada_3').style.zIndex = 403;
        map.getPane('pane_SededaAssociada_3').style['mix-blend-mode'] = 'normal';
        var layer_SededaAssociada_3 = new L.geoJson.multiStyle(json_SededaAssociada_3, {
            attribution: '',
            interactive: true,
            dataVar: 'json_SededaAssociada_3',
            layerName: 'layer_SededaAssociada_3',
            pane: 'pane_SededaAssociada_3',
            onEachFeature: pop_SededaAssociada_3,
            pointToLayers: [function (feature, latlng) {
                var context = {
                    feature: feature,
                    variables: {}
                };
                return L.circleMarker(latlng, style_SededaAssociada_3_0(feature));
            },function (feature, latlng) {
                var context = {
                    feature: feature,
                    variables: {}
                };
                return L.circleMarker(latlng, style_SededaAssociada_3_1(feature));
            },
        ]});
        bounds_group.addLayer(layer_SededaAssociada_3);
        function pop_UFdeOrigem_4(feature, layer) {
            var popupContent = '<table>\
                    <tr>\
                        <th scope="row">Ano</th>\
                        <td>' + (feature.properties['ANO'] !== null ? autolinker.link(String(feature.properties['ANO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">UF de origem</th>\
                        <td>' + (feature.properties['SIGLA_UF'] !== null ? autolinker.link(String(feature.properties['SIGLA_UF']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Nº de inscritos</th>\
                        <td>' + (feature.properties['N_INSCRICO'] !== null ? autolinker.link(String(feature.properties['N_INSCRICO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Longitude de origem</th>\
                        <td>' + (feature.properties['LONG_ORIG'] !== null ? autolinker.link(String(feature.properties['LONG_ORIG']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Latitude de origem</th>\
                        <td>' + (feature.properties['LAT_ORIG'] !== null ? autolinker.link(String(feature.properties['LAT_ORIG']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                </table>';
            var content = removeEmptyRowsFromPopupContent(popupContent, feature);
			layer.on('popupopen', function(e) {
				addClassToPopupIfMedia(content, e.popup);
			});
			layer.bindPopup(content, { maxHeight: 400 });
        }

        function style_UFdeOrigem_4_0() {
            return {
                pane: 'pane_UFdeOrigem_4',
        rotationAngle: 0.0,
        rotationOrigin: 'center center',
        icon: L.icon({
            iconUrl: 'markers/UFdeOrigem_4.svg',
            iconSize: [22.04, 22.04]
        }),
                interactive: true,
            }
        }
        map.createPane('pane_UFdeOrigem_4');
        map.getPane('pane_UFdeOrigem_4').style.zIndex = 404;
        map.getPane('pane_UFdeOrigem_4').style['mix-blend-mode'] = 'normal';
        var layer_UFdeOrigem_4 = new L.geoJson(json_UFdeOrigem_4, {
            attribution: '',
            interactive: true,
            dataVar: 'json_UFdeOrigem_4',
            layerName: 'layer_UFdeOrigem_4',
            pane: 'pane_UFdeOrigem_4',
            onEachFeature: pop_UFdeOrigem_4,
            pointToLayer: function (feature, latlng) {
                var context = {
                    feature: feature,
                    variables: {}
                };
                return L.marker(latlng, style_UFdeOrigem_4_0(feature));
            },
        });
        bounds_group.addLayer(layer_UFdeOrigem_4);
        function pop_FluxodeInscritosN_5(feature, layer) {
            var popupContent = '<table>\
                    <tr>\
                        <th scope="row">Ano</th>\
                        <td>' + (feature.properties['ANO'] !== null ? autolinker.link(String(feature.properties['ANO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">UF de origem</th>\
                        <td>' + (feature.properties['SIGLA_UF'] !== null ? autolinker.link(String(feature.properties['SIGLA_UF']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Associada</th>\
                        <td>' + (feature.properties['ASSOCIADA'] !== null ? autolinker.link(String(feature.properties['ASSOCIADA']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Nº de inscritos</th>\
                        <td>' + (feature.properties['N_INSCRICO'] !== null ? autolinker.link(String(feature.properties['N_INSCRICO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                </table>';
            var content = removeEmptyRowsFromPopupContent(popupContent, feature);
			layer.on('popupopen', function(e) {
				addClassToPopupIfMedia(content, e.popup);
			});
			layer.bindPopup(content, { maxHeight: 400 });
        }

        function style_FluxodeInscritosN_5_0(feature) {
            if (feature.properties['N_INSCRICO'] >= 1.000000 && feature.properties['N_INSCRICO'] <= 30.000000 ) {
                return {
                pane: 'pane_FluxodeInscritosN_5',
                interactive: true,
            }
            }
            if (feature.properties['N_INSCRICO'] >= 30.010000 && feature.properties['N_INSCRICO'] <= 60.000000 ) {
                return {
                pane: 'pane_FluxodeInscritosN_5',
                interactive: true,
            }
            }
            if (feature.properties['N_INSCRICO'] >= 60.010000 && feature.properties['N_INSCRICO'] <= 100.000000 ) {
                return {
                pane: 'pane_FluxodeInscritosN_5',
                interactive: true,
            }
            }
            if (feature.properties['N_INSCRICO'] >= 100.010000 && feature.properties['N_INSCRICO'] <= 300.000000 ) {
                return {
                pane: 'pane_FluxodeInscritosN_5',
                interactive: true,
            }
            }
        }
        map.createPane('pane_FluxodeInscritosN_5');
        map.getPane('pane_FluxodeInscritosN_5').style.zIndex = 405;
        map.getPane('pane_FluxodeInscritosN_5').style['mix-blend-mode'] = 'normal';
        var layer_FluxodeInscritosN_5 = createCurvedFlowLayer(json_FluxodeInscritosN_5, 'pane_FluxodeInscritosN_5', pop_FluxodeInscritosN_5);
        bounds_group.addLayer(layer_FluxodeInscritosN_5);
        function pop_SededaAssociada_6(feature, layer) {
            var popupContent = '<table>\
                    <tr>\
                        <th scope="row">Ano</th>\
                        <td>' + (feature.properties['ANO'] !== null ? autolinker.link(String(feature.properties['ANO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Associada</th>\
                        <td>' + (feature.properties['ASSOCIADA'] !== null ? autolinker.link(String(feature.properties['ASSOCIADA']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Latitude da associada</th>\
                        <td>' + (feature.properties['LAT_ASS'] !== null ? autolinker.link(String(feature.properties['LAT_ASS']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Longitude da associada</th>\
                        <td>' + (feature.properties['LONG_ASS'] !== null ? autolinker.link(String(feature.properties['LONG_ASS']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Nº de inscritos</th>\
                        <td>' + (feature.properties['N_INSCRICO'] !== null ? autolinker.link(String(feature.properties['N_INSCRICO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                </table>';
            var content = removeEmptyRowsFromPopupContent(popupContent, feature);
			layer.on('popupopen', function(e) {
				addClassToPopupIfMedia(content, e.popup);
			});
			layer.bindPopup(content, { maxHeight: 400 });
        }

        function style_SededaAssociada_6_0() {
            return {
                pane: 'pane_SededaAssociada_6',
                radius: 6.4,
                opacity: 1,
                color: 'rgba(0,0,0,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(255,255,255,1.0)',
                interactive: true,
            }
        }
        function style_SededaAssociada_6_1() {
            return {
                pane: 'pane_SededaAssociada_6',
                radius: 1.4,
                opacity: 1,
                color: 'rgba(0,0,0,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 2.0,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(0,0,0,1.0)',
                interactive: true,
            }
        }
        map.createPane('pane_SededaAssociada_6');
        map.getPane('pane_SededaAssociada_6').style.zIndex = 406;
        map.getPane('pane_SededaAssociada_6').style['mix-blend-mode'] = 'normal';
        var layer_SededaAssociada_6 = new L.geoJson.multiStyle(json_SededaAssociada_6, {
            attribution: '',
            interactive: true,
            dataVar: 'json_SededaAssociada_6',
            layerName: 'layer_SededaAssociada_6',
            pane: 'pane_SededaAssociada_6',
            onEachFeature: pop_SededaAssociada_6,
            pointToLayers: [function (feature, latlng) {
                var context = {
                    feature: feature,
                    variables: {}
                };
                return L.circleMarker(latlng, style_SededaAssociada_6_0(feature));
            },function (feature, latlng) {
                var context = {
                    feature: feature,
                    variables: {}
                };
                return L.circleMarker(latlng, style_SededaAssociada_6_1(feature));
            },
        ]});
        bounds_group.addLayer(layer_SededaAssociada_6);
        function pop_UFdeOrigem_7(feature, layer) {
            var popupContent = '<table>\
                    <tr>\
                        <th scope="row">Ano</th>\
                        <td>' + (feature.properties['ANO'] !== null ? autolinker.link(String(feature.properties['ANO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">UF de origem</th>\
                        <td>' + (feature.properties['SIGLA_UF'] !== null ? autolinker.link(String(feature.properties['SIGLA_UF']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Nº de inscritos</th>\
                        <td>' + (feature.properties['N_INSCRICO'] !== null ? autolinker.link(String(feature.properties['N_INSCRICO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Longitude de origem</th>\
                        <td>' + (feature.properties['LONG_ORIG'] !== null ? autolinker.link(String(feature.properties['LONG_ORIG']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Latitude de origem</th>\
                        <td>' + (feature.properties['LAT_ORIG'] !== null ? autolinker.link(String(feature.properties['LAT_ORIG']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                </table>';
            var content = removeEmptyRowsFromPopupContent(popupContent, feature);
			layer.on('popupopen', function(e) {
				addClassToPopupIfMedia(content, e.popup);
			});
			layer.bindPopup(content, { maxHeight: 400 });
        }

        function style_UFdeOrigem_7_0() {
            return {
                pane: 'pane_UFdeOrigem_7',
        rotationAngle: 0.0,
        rotationOrigin: 'center center',
        icon: L.icon({
            iconUrl: 'markers/UFdeOrigem_7.svg',
            iconSize: [22.04, 22.04]
        }),
                interactive: true,
            }
        }
        map.createPane('pane_UFdeOrigem_7');
        map.getPane('pane_UFdeOrigem_7').style.zIndex = 407;
        map.getPane('pane_UFdeOrigem_7').style['mix-blend-mode'] = 'normal';
        var layer_UFdeOrigem_7 = new L.geoJson(json_UFdeOrigem_7, {
            attribution: '',
            interactive: true,
            dataVar: 'json_UFdeOrigem_7',
            layerName: 'layer_UFdeOrigem_7',
            pane: 'pane_UFdeOrigem_7',
            onEachFeature: pop_UFdeOrigem_7,
            pointToLayer: function (feature, latlng) {
                var context = {
                    feature: feature,
                    variables: {}
                };
                return L.marker(latlng, style_UFdeOrigem_7_0(feature));
            },
        });
        bounds_group.addLayer(layer_UFdeOrigem_7);
        function pop_FluxodeInscritosN_8(feature, layer) {
            var popupContent = '<table>\
                    <tr>\
                        <th scope="row">Ano</th>\
                        <td>' + (feature.properties['ANO'] !== null ? autolinker.link(String(feature.properties['ANO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">UF de origem</th>\
                        <td>' + (feature.properties['SIGLA_UF'] !== null ? autolinker.link(String(feature.properties['SIGLA_UF']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Associada</th>\
                        <td>' + (feature.properties['ASSOCIADA'] !== null ? autolinker.link(String(feature.properties['ASSOCIADA']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Nº de inscritos</th>\
                        <td>' + (feature.properties['N_INSCRICO'] !== null ? autolinker.link(String(feature.properties['N_INSCRICO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                </table>';
            var content = removeEmptyRowsFromPopupContent(popupContent, feature);
			layer.on('popupopen', function(e) {
				addClassToPopupIfMedia(content, e.popup);
			});
			layer.bindPopup(content, { maxHeight: 400 });
        }

        function style_FluxodeInscritosN_8_0(feature) {
            if (feature.properties['N_INSCRICO'] >= 1.000000 && feature.properties['N_INSCRICO'] <= 30.000000 ) {
                return {
                pane: 'pane_FluxodeInscritosN_8',
                interactive: true,
            }
            }
            if (feature.properties['N_INSCRICO'] >= 30.010000 && feature.properties['N_INSCRICO'] <= 60.000000 ) {
                return {
                pane: 'pane_FluxodeInscritosN_8',
                interactive: true,
            }
            }
            if (feature.properties['N_INSCRICO'] >= 60.010000 && feature.properties['N_INSCRICO'] <= 100.000000 ) {
                return {
                pane: 'pane_FluxodeInscritosN_8',
                interactive: true,
            }
            }
            if (feature.properties['N_INSCRICO'] >= 100.010000 && feature.properties['N_INSCRICO'] <= 300.000000 ) {
                return {
                pane: 'pane_FluxodeInscritosN_8',
                interactive: true,
            }
            }
        }
        map.createPane('pane_FluxodeInscritosN_8');
        map.getPane('pane_FluxodeInscritosN_8').style.zIndex = 408;
        map.getPane('pane_FluxodeInscritosN_8').style['mix-blend-mode'] = 'normal';
        var layer_FluxodeInscritosN_8 = createCurvedFlowLayer(json_FluxodeInscritosN_8, 'pane_FluxodeInscritosN_8', pop_FluxodeInscritosN_8);
        bounds_group.addLayer(layer_FluxodeInscritosN_8);
        map.addLayer(layer_FluxodeInscritosN_8);
        function pop_SededaAssociada_9(feature, layer) {
            var popupContent = '<table>\
                    <tr>\
                        <th scope="row">Ano</th>\
                        <td>' + (feature.properties['ANO'] !== null ? autolinker.link(String(feature.properties['ANO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Associada</th>\
                        <td>' + (feature.properties['ASSOCIADA'] !== null ? autolinker.link(String(feature.properties['ASSOCIADA']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Latitude da associada</th>\
                        <td>' + (feature.properties['LAT_ASS'] !== null ? autolinker.link(String(feature.properties['LAT_ASS']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Longitude da associada</th>\
                        <td>' + (feature.properties['LONG_ASS'] !== null ? autolinker.link(String(feature.properties['LONG_ASS']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Nº de inscritos</th>\
                        <td>' + (feature.properties['N_INSCRICO'] !== null ? autolinker.link(String(feature.properties['N_INSCRICO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                </table>';
            var content = removeEmptyRowsFromPopupContent(popupContent, feature);
			layer.on('popupopen', function(e) {
				addClassToPopupIfMedia(content, e.popup);
			});
			layer.bindPopup(content, { maxHeight: 400 });
        }

        function style_SededaAssociada_9_0() {
            return {
                pane: 'pane_SededaAssociada_9',
                radius: 6.4,
                opacity: 1,
                color: 'rgba(0,0,0,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(255,255,255,1.0)',
                interactive: true,
            }
        }
        function style_SededaAssociada_9_1() {
            return {
                pane: 'pane_SededaAssociada_9',
                radius: 1.4,
                opacity: 1,
                color: 'rgba(0,0,0,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 2.0,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(0,0,0,1.0)',
                interactive: true,
            }
        }
        map.createPane('pane_SededaAssociada_9');
        map.getPane('pane_SededaAssociada_9').style.zIndex = 409;
        map.getPane('pane_SededaAssociada_9').style['mix-blend-mode'] = 'normal';
        var layer_SededaAssociada_9 = new L.geoJson.multiStyle(json_SededaAssociada_9, {
            attribution: '',
            interactive: true,
            dataVar: 'json_SededaAssociada_9',
            layerName: 'layer_SededaAssociada_9',
            pane: 'pane_SededaAssociada_9',
            onEachFeature: pop_SededaAssociada_9,
            pointToLayers: [function (feature, latlng) {
                var context = {
                    feature: feature,
                    variables: {}
                };
                return L.circleMarker(latlng, style_SededaAssociada_9_0(feature));
            },function (feature, latlng) {
                var context = {
                    feature: feature,
                    variables: {}
                };
                return L.circleMarker(latlng, style_SededaAssociada_9_1(feature));
            },
        ]});
        bounds_group.addLayer(layer_SededaAssociada_9);
        map.addLayer(layer_SededaAssociada_9);
        function pop_UFdeOrigem_10(feature, layer) {
            var popupContent = '<table>\
                    <tr>\
                        <th scope="row">Ano</th>\
                        <td>' + (feature.properties['ANO'] !== null ? autolinker.link(String(feature.properties['ANO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">UF de origem</th>\
                        <td>' + (feature.properties['SIGLA_UF'] !== null ? autolinker.link(String(feature.properties['SIGLA_UF']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Nº de inscritos</th>\
                        <td>' + (feature.properties['N_INSCRICO'] !== null ? autolinker.link(String(feature.properties['N_INSCRICO']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Longitude de origem</th>\
                        <td>' + (feature.properties['LONG_ORIG'] !== null ? autolinker.link(String(feature.properties['LONG_ORIG']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Latitude de origem</th>\
                        <td>' + (feature.properties['LAT_ORIG'] !== null ? autolinker.link(String(feature.properties['LAT_ORIG']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
                    </tr>\
                </table>';
            var content = removeEmptyRowsFromPopupContent(popupContent, feature);
			layer.on('popupopen', function(e) {
				addClassToPopupIfMedia(content, e.popup);
			});
			layer.bindPopup(content, { maxHeight: 400 });
        }

        function style_UFdeOrigem_10_0() {
            return {
                pane: 'pane_UFdeOrigem_10',
        rotationAngle: 0.0,
        rotationOrigin: 'center center',
        icon: L.icon({
            iconUrl: 'markers/UFdeOrigem_10.svg',
            iconSize: [22.04, 22.04]
        }),
                interactive: true,
            }
        }
        map.createPane('pane_UFdeOrigem_10');
        map.getPane('pane_UFdeOrigem_10').style.zIndex = 410;
        map.getPane('pane_UFdeOrigem_10').style['mix-blend-mode'] = 'normal';
        var layer_UFdeOrigem_10 = new L.geoJson(json_UFdeOrigem_10, {
            attribution: '',
            interactive: true,
            dataVar: 'json_UFdeOrigem_10',
            layerName: 'layer_UFdeOrigem_10',
            pane: 'pane_UFdeOrigem_10',
            onEachFeature: pop_UFdeOrigem_10,
            pointToLayer: function (feature, latlng) {
                var context = {
                    feature: feature,
                    variables: {}
                };
                return L.marker(latlng, style_UFdeOrigem_10_0(feature));
            },
        });
        bounds_group.addLayer(layer_UFdeOrigem_10);
        map.addLayer(layer_UFdeOrigem_10);
        map.createPane('pane_2025_11');
        map.getPane('pane_2025_11').style.zIndex = 411;
        var img_2025_11 = 'data/2025_11.png';
        var img_bounds_2025_11 = [[-28.29305592500422,-58.73910131199452],[2.7047786566802006,-29.736532083573344]];
        var layer_2025_11 = new L.imageOverlay(img_2025_11,
                                              img_bounds_2025_11,
                                              {pane: 'pane_2025_11'});
        bounds_group.addLayer(layer_2025_11);
        map.createPane('pane_2021_12');
        map.getPane('pane_2021_12').style.zIndex = 412;
        var img_2021_12 = 'data/2021_12.png';
        var img_bounds_2021_12 = [[-28.268094908405175,-54.14077528641954],[-0.9971614248692293,-29.77792212287939]];
        var layer_2021_12 = new L.imageOverlay(img_2021_12,
                                              img_bounds_2021_12,
                                              {pane: 'pane_2021_12'});
        bounds_group.addLayer(layer_2021_12);
        map.createPane('pane_2018_13');
        map.getPane('pane_2018_13').style.zIndex = 413;
        var img_2018_13 = 'data/2018_13.png';
        var img_bounds_2018_13 = [[-28.268094908405175,-54.14077528641954],[-0.9971614248692293,-29.77792212287939]];
        var layer_2018_13 = new L.imageOverlay(img_2018_13,
                                              img_bounds_2018_13,
                                              {pane: 'pane_2018_13'});
        bounds_group.addLayer(layer_2018_13);
        map.addLayer(layer_2018_13);
        var overlaysTree = [
        {label: '<b>Concentração de Inscrições </b>',  selectAllCheckbox: true, children: [
            {label: "2018", layer: layer_2018_13},
            {label: "2021", layer: layer_2021_12},
            {label: "2025", layer: layer_2025_11},]},
        {label: '<b>2018</b>', collapsed: true, selectAllCheckbox: true, children: [
            {label: '<img src="legend/UFdeOrigem_10.png" /> UF de Origem', layer: layer_UFdeOrigem_10},
            {label: '<img src="legend/SededaAssociada_9.png" /> Sede da Associada', layer: layer_SededaAssociada_9},
            {label: 'Fluxo de Inscritos (Nº)<br /><table><tr><td style="text-align: center;"><img src="legend/FluxodeInscritosN_8_Até30inscritos0.png" /></td><td>Até 30 inscritos</td></tr><tr><td style="text-align: center;"><img src="legend/FluxodeInscritosN_8_maisde30até60inscritos1.png" /></td><td>mais de 30 até 60 inscritos</td></tr><tr><td style="text-align: center;"><img src="legend/FluxodeInscritosN_8_maisde60até100inscritos2.png" /></td><td>mais de 60 até 100 inscritos</td></tr><tr><td style="text-align: center;"><img src="legend/FluxodeInscritosN_8_maisde100inscritos3.png" /></td><td>mais de 100 inscritos</td></tr></table>', layer: layer_FluxodeInscritosN_8},]},
        {label: '<b>2021</b>', collapsed: true, selectAllCheckbox: true, children: [
            {label: '<img src="legend/UFdeOrigem_7.png" /> UF de Origem', layer: layer_UFdeOrigem_7},
            {label: '<img src="legend/SededaAssociada_6.png" /> Sede da Associada', layer: layer_SededaAssociada_6},
            {label: 'Fluxo de Inscritos (Nº)<br /><table><tr><td style="text-align: center;"><img src="legend/FluxodeInscritosN_5_Até30inscritos0.png" /></td><td>Até 30 inscritos</td></tr><tr><td style="text-align: center;"><img src="legend/FluxodeInscritosN_5_maisde30até60inscritos1.png" /></td><td>mais de 30 até 60 inscritos</td></tr><tr><td style="text-align: center;"><img src="legend/FluxodeInscritosN_5_maisde60até100inscritos2.png" /></td><td>mais de 60 até 100 inscritos</td></tr><tr><td style="text-align: center;"><img src="legend/FluxodeInscritosN_5_maisde100inscritos3.png" /></td><td>mais de 100 inscritos</td></tr></table>', layer: layer_FluxodeInscritosN_5},]},
        {label: '<b>2025</b>', collapsed: true, selectAllCheckbox: true, children: [
            {label: '<img src="legend/UFdeOrigem_4.png" /> UF de Origem', layer: layer_UFdeOrigem_4},
            {label: '<img src="legend/SededaAssociada_3.png" /> Sede da Associada', layer: layer_SededaAssociada_3},
            {label: 'Fluxo de Inscritos (Nº)<br /><table><tr><td style="text-align: center;"><img src="legend/FluxodeInscritosN_2_Até30inscritos0.png" /></td><td>Até 30 inscritos</td></tr><tr><td style="text-align: center;"><img src="legend/FluxodeInscritosN_2_maisde30até60inscritos1.png" /></td><td>mais de 30 até 60 inscritos</td></tr><tr><td style="text-align: center;"><img src="legend/FluxodeInscritosN_2_maisde60até100inscritos2.png" /></td><td>mais de 60 até 100 inscritos</td></tr><tr><td style="text-align: center;"><img src="legend/FluxodeInscritosN_2_maisde100inscritos3.png" /></td><td>mais de 100 inscritos</td></tr></table>', layer: layer_FluxodeInscritosN_2},]},
            {label: '<img src="legend/LimitesdasUFs_1.png" /> Limites das UFs', layer: layer_LimitesdasUFs_1},
            {label: "ESRI Gray (light)", layer: layer_ESRIGraylight_0, radioGroup: 'bm' },]
        var lay = L.control.layers.tree(null, overlaysTree,{
            //namedToggle: true,
            //selectorBack: false,
            //closedSymbol: '&#8862; &#x1f5c0;',
            //openedSymbol: '&#8863; &#x1f5c1;',
            //collapseAll: 'Collapse all',
            //expandAll: 'Expand all',
            collapsed: false, 
        });
        lay.addTo(map);
		document.addEventListener("DOMContentLoaded", function() {
            // set new Layers List height which considers toggle icon
            function newLayersListHeight() {
                var layerScrollbarElement = document.querySelector('.leaflet-control-layers-scrollbar');
                if (layerScrollbarElement) {
                    var layersListElement = document.querySelector('.leaflet-control-layers-list');
                    var originalHeight = layersListElement.style.height 
                        || window.getComputedStyle(layersListElement).height;
                    var newHeight = parseFloat(originalHeight) - 50;
                    layersListElement.style.height = newHeight + 'px';
                }
            }
            var isLayersListExpanded = true;
            var controlLayersElement = document.querySelector('.leaflet-control-layers');
            var toggleLayerControl = document.querySelector('.leaflet-control-layers-toggle');
            // toggle Collapsed/Expanded and apply new Layers List height
            toggleLayerControl.addEventListener('click', function() {
                if (isLayersListExpanded) {
                    controlLayersElement.classList.remove('leaflet-control-layers-expanded');
                } else {
                    controlLayersElement.classList.add('leaflet-control-layers-expanded');
                }
                isLayersListExpanded = !isLayersListExpanded;
                newLayersListHeight()
            });	
			// apply new Layers List height if toggle layerstree
			if (controlLayersElement) {
				controlLayersElement.addEventListener('click', function(event) {
					var toggleLayerHeaderPointer = event.target.closest('.leaflet-layerstree-header-pointer span');
					if (toggleLayerHeaderPointer) {
						newLayersListHeight();
					}
				});
			}
            // Collapsed/Expanded at Start to apply new height
            setTimeout(function() {
                toggleLayerControl.click();
            }, 10);
            setTimeout(function() {
                toggleLayerControl.click();
            }, 10);
            // Collapsed touch/small screen
            var isSmallScreen = window.innerWidth < 650;
            if (isSmallScreen) {
                setTimeout(function() {
                    controlLayersElement.classList.remove('leaflet-control-layers-expanded');
                    isLayersListExpanded = !isLayersListExpanded;
                }, 500);
            }  
        });       

        // Legenda contínua do mapa de concentração
        var heatLegend=L.control({position:'bottomright'});
        heatLegend.onAdd=function(){var d=L.DomUtil.create('div','heat-legend-control');d.innerHTML='<div class="heat-legend-title">Concentração de inscrições</div><div class="heat-legend-gradient"></div><div class="heat-legend-labels"><span>Baixa</span><span>Média</span><span>Alta</span></div>';L.DomEvent.disableClickPropagation(d);return d;};
        heatLegend.addTo(map);
        setBounds();
        var i = 0;
        layer_UFdeOrigem_4.eachLayer(function(layer) {
            var context = {
                feature: layer.feature,
                variables: {}
            };
            layer.bindTooltip((layer.feature.properties['SIGLA_UF'] !== null?String('<div style="color: #323232; font-size: 7pt; font-family: \'Open Sans\', sans-serif;">' + layer.feature.properties['SIGLA_UF']) + '</div>':''), {permanent: true, offset: [-0, -16], className: 'css_UFdeOrigem_4'});
            labels.push(layer);
            totalMarkers += 1;
              layer.added = true;
              addLabel(layer, i);
              i++;
        });
        var i = 0;
        layer_UFdeOrigem_7.eachLayer(function(layer) {
            var context = {
                feature: layer.feature,
                variables: {}
            };
            layer.bindTooltip((layer.feature.properties['SIGLA_UF'] !== null?String('<div style="color: #323232; font-size: 7pt; font-family: \'Open Sans\', sans-serif;">' + layer.feature.properties['SIGLA_UF']) + '</div>':''), {permanent: true, offset: [-0, -16], className: 'css_UFdeOrigem_7'});
            labels.push(layer);
            totalMarkers += 1;
              layer.added = true;
              addLabel(layer, i);
              i++;
        });
        var i = 0;
        layer_UFdeOrigem_10.eachLayer(function(layer) {
            var context = {
                feature: layer.feature,
                variables: {}
            };
            layer.bindTooltip((layer.feature.properties['SIGLA_UF'] !== null?String('<div style="color: #323232; font-size: 7pt; font-family: \'Open Sans\', sans-serif;">' + layer.feature.properties['SIGLA_UF']) + '</div>':''), {permanent: true, offset: [-0, -16], className: 'css_UFdeOrigem_10'});
            labels.push(layer);
            totalMarkers += 1;
              layer.added = true;
              addLabel(layer, i);
              i++;
        });
        L.ImageOverlay.include({
            getBounds: function () {
                return this._bounds;
            }
        });
        resetLabels([layer_UFdeOrigem_4,layer_UFdeOrigem_7,layer_UFdeOrigem_10]);
        map.on("zoomend", function(){
            resetLabels([layer_UFdeOrigem_4,layer_UFdeOrigem_7,layer_UFdeOrigem_10]);
        });
        map.on("layeradd", function(){
            resetLabels([layer_UFdeOrigem_4,layer_UFdeOrigem_7,layer_UFdeOrigem_10]);
        });
        map.on("layerremove", function(){
            resetLabels([layer_UFdeOrigem_4,layer_UFdeOrigem_7,layer_UFdeOrigem_10]);
        });
        