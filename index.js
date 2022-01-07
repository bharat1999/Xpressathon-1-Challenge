import lineReader from 'line-reader';
import fs from 'fs';
import fetch from 'node-fetch';



var addresses = {
    addresses: []
}



var detail = []

function makeArray()
{
    return new Promise((resolve, reject) => {
        lineReader.eachLine('address.txt',function (line, last) {

            var pincode = line.slice(line.length - 7)
            pincode = pincode.replace('-', '')
            pincode = pincode.replace(' ', '')
            let d = {
                    line:line,
                    pincode:pincode
                } 
            detail.push(d)
            if (last) {
                resolve() // stop reading
            }
        });
    });
    
}

async function makeJson() {

    await makeArray()

    for(var i=0;i<detail.length;i++)
    {
        const response = await fetch(`https://api.data.gov.in/resource/9115b89c-7a80-4f54-9b06-21086e0f0bd7?api-key=579b464db66ec23bdd000001e177813f964d4a074dc096303fa59b8b&format=json&offset=0&limit=10&filters[pincode]=${detail[i].pincode}`);
        var data = await response.json()
        if(typeof data =="undefined") { continue;}
        if(typeof data.records =="undefined") {continue}
        if(typeof data.records[0] =="undefined") {continue}

        var locality = (typeof data.records[0].village_locality_name!="undefined")?data.records[0].village_locality_name:" ";
        var city = data.records[0].districtname
        var state = data.records[0].statename
        detail[i].line = detail[i].line.replace('India','')
        detail[i].line = detail[i].line.replace(detail[i].pincode,'')
        let add = {
                addressline:detail[i].line,
                locality:locality,
                city: city,
                state: state,
                pincode:detail[i].pincode
            }
        addresses.addresses.push(add)
    }
    fs.writeFile("address.json", JSON.stringify(addresses), err => {
        // Checking for errors
        if (err) throw err;
        console.log("Done writing"); // Success
    });        
}




makeJson()
