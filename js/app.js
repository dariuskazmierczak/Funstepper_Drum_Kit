import {create,group, el,openFullscreen,closeFullscreen} from '../modules/lib.js';
import {db} from '../modules/db.js';



(function(){

//    console.log(navigator) 

    function serviceworkerActive(){
        if ('serviceWorker' in navigator){

            // ServiceWorker registrieren
            navigator.serviceWorker.register('./service-worker.js',{scope:'./'})
            .then(() => {
                console.log('Service Worker erfolgreich registriert');
            })
            .catch((error) => {
                console.log(error,'uuups');
             })

        };

    };
    // serviceworkerActive();
   
  
    let animate = false; // triggert den timeout
    let counter = 0;
    let speed  = 120;



    async function loadJson(){
        let allSounds = await (await fetch('./data/sounds.json')).json();
        let instruments = await (await fetch('./data/instruments.json')).json();
        let volumes = await (await fetch('./data/volumes.json')).json();
        console.log(volumes)
        funStepper (allSounds,instruments,volumes);
    };

    function funStepper (allSounds,instruments,volumes) {

        function createSequenzer(){
            let max = 16;
            // 16 rows - 16 columms

            let div1,div2,label,input,b;
            let counter1 = 0;

            for (let i = 0; i < max; i ++){
                div1 = create('div');
                div1.className = "zeile";
                // Instrument Name
                b = create('b');
                b.innerHTML = instruments[i];
                b.setAttribute('id',`b${i}`);
                div1.append(b);
                el('#sequenzer').append(div1);
                div2 = create('div');

                for (let ii = 0; ii < max; ii ++){
                    // inputs / label
                    label = create('label');
                    counter1 ++;
                    label.setAttribute('for',`c${counter1}`);
                    label.setAttribute('id',`label-c${counter1}`);
                    label.setAttribute('data-role',ii); // Sound synchronisieren
                    label.classList.add('grau','passiv');
                    label.setAttribute('style','border:5px solid darkgrey')
                    label.addEventListener('click',markColors);

                    input = create('input');
                    input.setAttribute('type','checkbox');
                    input.setAttribute('id',`c${counter1}`);
                    input.setAttribute('data-sound',i);
                    input.setAttribute('data-role',ii);
                    div2.append(input);
                    div2.append(label);
                    div2.className = 'container';

                }
                div1.append(div2)

            };

        }; // ENDE createSequenzer

        function markColors(){
            let colAktiv = '5px solid blue';
            let colPassiv = '5px solid darkgrey';

            let zustand = this.style.border;

            if (zustand == colPassiv){
                this.style.border = colAktiv;
            }else{
                this.style.border = colPassiv;
            }
        }; // ENDE markColors

        function loop(){
            let allLabels = group('#sequenzer label');
            // let labelsaktiv = group('#sequenzer label[data-role = "'+counter+'"]')
            let labelsAktiv = group(`#sequenzer label[data-role = "${counter}" ]`);
            let allChecksAktiv = group(`#sequenzer input[data-role = "${counter}" ]`);

            allChecksAktiv.forEach((input) => {
                // SoundAuswahl
                 if(input.checked){

                    let index = parseInt(input.getAttribute('data-sound'));
                    let audio = new Audio(allSounds[index]);
                    //  audio.src = allSounds[index];
                    audio.volume = volumes[index];
                    audio.play();
                 };



            });


                // alle Label grau f??rben
            allLabels.forEach( (label) => {
                label.className = 'grau';
            });
            //     // aktive Label rot f??rben

            labelsAktiv.forEach((label) => {
                label.className = 'rot';
            });

            counter ++;
            if(counter === 16){
                counter = 0;
            };     

       
            
            
            
            
            animate = setTimeout(loop,speed); 
        }; // ENDE loop

        function clearAll(){
            // 1. check status zur??cksetzen
            group('#sequenzer input').forEach((input) => {
                input.checked = false;
            });

            // 2. Zur??cksetzen der Einf??rbung
            let colPassiv = '5px solid darkgrey';
            group('#sequenzer label').forEach((label) => {
                label.style.border = colPassiv;
            });
        };
        //###################################################
        // Abteilung Save

        function showSaveArea(){
            el('#nameholder').className = 'nameholder_aktiv';
            // Anhalten  des Sound Loops
            if (animate){
                clearTimeout(animate);
                animate = false;
            };

        };


        function saveSong(){
            el('#info').innerHTML = '';
            let titel = el('#songtitel').value; 

            // Pr??fung ob ein titel eingegeben wurde
            if (titel[0] == " " ||  titel.length < 4){
                el('#info').innerHTML = 'Geben Sie bitte einen Titel ein ';
                return;
            };
            // optionale Pr??fung auf titel Dopplung
            // Pr??fung Ende
            el('#nameholder').className = 'nameholder_passiv';

            // Object f??r die DB vorbereiten
            let sample      = {};
            sample.title    = titel;
            sample.checked  = {};
            sample.bpm      = speed;
            sample.id       = Date.now();

            // Abfragen des checked Status der input Elemente 
            group('#sequenzer input').forEach((input) => {
                if (input.checked){
                    sample.checked[input.id] = true;
                }else{
                    sample.checked[input.id] = false;
                }

            });
           db.updateDB(sample);
        };


        function showLoadArea(){
            el('#sampleholder').className = 'sampleholder_aktiv';
            if (animate){
                clearTimeout(animate);
                animate = false;
            };
            loadSamples();
        };

        async function loadSamples(){
            el('#info_lesen').innerHTML = '';
            el('#showsamples').innerHTML = '';
            // 1. Daten aus DB lesen
            let data = await db.readDB();
            console.log(data)
            if (data.length === 0){
                el('#info_lesen').innerHTML = "Es sind keine Daten in der DB";
                return;
            };

            // Gespeicherte Titel anzeigen


            let div,wahlButton,deleteButton,span;

            data.forEach((sample) => {

                div         = create('div');
                // Wahl button
                wahlButton  = create ('button');
                wahlButton.innerHTML = 'Sample w??hlen';
                wahlButton.setAttribute('data-id',sample.id);
                wahlButton.addEventListener('click',chooseSample) ;   

                // Delete Button

                deleteButton = create('button');
                deleteButton.setAttribute('data-id',sample.id);
                deleteButton.innerHTML = "Sample l??schen";


                // Titel Anzeige
                span    = create('span');
                span.innerHTML = sample.title;

                div.append(wahlButton);
                div.append(span);
                div.append(deleteButton);

                // Sample l??schen    
                deleteButton.addEventListener('click',deleteSample);

                el('#showsamples').append(div);



            });
        };

        // Sample w??hlen 
        async function chooseSample(){
            let colAktiv = '5px solid red';
            let colPassiv = '5px solid darkgrey';

            //1. DB auslesen
            let data = await db.readDB();
            // gesuchten sample aus dem Array suchen
            // 1. ID aud dem button auslesen
            let id = this.getAttribute('data-id');
            // 2. Song mit passender ID im array suchen / finden
            let sample = data.find((song) => song.id == id);

            if (!sample){
                // Hinweis f??r User
                console.log('Es ist ein Problem aufgetreten')
                return; // Abbruch der Funktion
            };
            // ??bergabe speed --- Geschwindigkeit des Loops
            speed = sample.speed;
        //  console.log(sample.checked);
            el('#sample-titel').innerHTML = sample.title;
            console.log(sample.title)
         // Durchlaufen des checked Objects
            for (let i in sample.checked){
                // i ist die id der inputs
                //'label-' + i ---id des Labels
                let val =  sample.checked[i];
                // val stellt die checked Eigenschaft der Inputs dar - true / false
                // console.log(val)

                el(`#${i}`).checked = val;

                // label einf??rben
                if (val){
                    el(`#label-${i}`).style.border = colAktiv;
                }else{
                    el(`#label-${i}`).style.border = colPassiv;
                }
                
            }; // ENDE for
         // Eingabe Maske weg
         el('#sampleholder').className = 'sampleholder_passiv';

        };// ENDE chooseSample

        async function deleteSample(){
            if (!confirm('Achtung, Sie l??schen jetzt diesen Titel!')){

                return;
            };
           
           let data = await db.readDB();
           
           let dataId = this.getAttribute('data-id');
            // index suchen
            let index = data.findIndex((sample) => sample.id == dataId);
            // Sample aus dem array l??schen
            data.splice(index,1);
            // Das aktualisierte Array wieder in DB schreiben
            db.writeDB(data);

            // DOM aufr??umen
            let div = this.parentNode;
            el('#showsamples').removeChild(div);
        };

        ///////////////////////////////////////////////////////////////////

        function changeSpeed(){
            speed = Number(this.value);
            el('#demo').innerHTML = speed;
        }
     

        //////////////////////////////////////////////////////////////////////////


        //#######################################################
        // Zuweisen und ausf??hren

        el('#speed').addEventListener('input',changeSpeed);

        // Save Area
        el('#save').addEventListener('click',showSaveArea);
        el('#savesong').addEventListener('click',saveSong); 
        el('#abbrechen').addEventListener('click',function(){
            el('#nameholder').className = 'nameholder_passiv';
        });
        //##################################################################
        // Load area
        el('#load').addEventListener('click',showLoadArea);
        // load Area weg
        el('#sampleholder_hide').addEventListener('click',function(){
            el('#sampleholder').className = 'sampleholder_passiv';
        });

        //########################################################

       el('#clear').addEventListener('click',clearAll) ;
       el('#run-pause').addEventListener('click',function(){

        if (!animate){
            loop();
            this.className = 'runstop-aktiv';
            this.innerHTML = 'Pause'
            return;
        }else{
            clearTimeout(animate);
            this.className = 'runstop-passiv';
            this.innerHTML = 'Run';
            animate = false;
        }
      });


      let flag = false;
      el('#fullscreen').addEventListener('click',function(){
          if (!flag){
            openFullscreen(el('body'));
            this.innerHTML = "Exit Fullscreen";
          }else{
            this.innerHTML = "Fullscreen";
            closeFullscreen();
          }
          flag = !flag;
      });

        createSequenzer();       
    };



    loadJson()
})();
