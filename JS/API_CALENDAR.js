// Converte um date em string iso
function getIsoDate(dt) {
    var year = dt.getUTCFullYear();
    var month = dt.getUTCMonth() + 1;
    var day = dt.getUTCDate();

    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;

    return year + "-" + month + "-" + day;
}

// So para retornar hoje na forma que o servidor espera
function getTodayAsIsoDate() {
    var dt = new Date();
    return getIsoDate(dt);
}
                
function getDateFromJson(jsonDate) {
    if (jsonDate.substr(0, 1) === "/"){
        // Data no formato JSON antigo
        // Crédito para https://sudarshanbhalerao.wordpress.com/2011/08/14/convert-json-date-into-javascript-date/
        var offset = new Date().getTimezoneOffset() * 60000;
        var parts = /\/Date\((-?\d+)([+-]\d{2})?(\d{2})?.*/.exec(jsonDate);
        
        if (parts[2] == undefined) 
          parts[2] = 0;
        
        if (parts[3] == undefined) 
          parts[3] = 0;
        
        var dt = new Date(+parts[1] + offset + parts[2]*3600000 + parts[3]*60000);
        return getIsoDate(dt);
    }
    else{
        // Assumo que esta em iso
        return jsonDate.substr(0, 10);
    }				
}		

$(function () {

    // Popula a data inicial como hoje
    var today = getTodayAsIsoDate();

    $("#initialDate").val(today);
    $("#initialDateDelta").val(today);

    var td1M = new Date();
    td1M.setMonth(td1M.getMonth() + 1);
    $("#finalDateDelta").val(getIsoDate(td1M));

    // Aqui acontecerá a mágica
    $("#calculate").click(function () {
        var calendar = $("#calendar").val();
        var initialDate = $("#initialDate").val();
        var days = $("#term").val();

        // Com CORS habilitado em nossa API, o callback (via jsonp não é mais necessário)
        var url = "https://elekto.com.br/api/Calendars/" + calendar + "/Add?initialDate=" + initialDate + "&days=" + days + "&type=work&finalAdjust=none";
        $.getJSON(url, function(r){
                var finalDate = getDateFromJson(r);
                $("#finalDate").val(finalDate);
            }
        )
        .fail(function(jqXhr, textStatus, errorThrown) {
            var err = textStatus + ', ' + errorThrown;
            console.log( "Request Failed: " + err);
            alert("Problemas: " + err);
        });
    });

    $("#calculateDelta").click(function () {
        var calendar = $("#calendarDelta").val();
        var initialDate = $("#initialDateDelta").val();
        var finalDate = $("#finalDateDelta").val();

        var url = "https://elekto.com.br/api/Calendars/" + calendar + "/Delta?initialDate=" + initialDate + "&finalDate=" + finalDate + "&type=financial";
        $.getJSON(url, function (r) {
                    $("#termDelta").val(r["WorkDays"]);
                    $("#termDeltaActual").val(r["ActualDays"]);
                }
            )
            .fail(function(jqXhr, textStatus, errorThrown) {
                var err = textStatus + ', ' + errorThrown;
                console.log( "Request Failed: " + err);
                alert("Problemas: " + err);
            });

    });

});