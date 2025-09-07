const fetch = require('node-fetch');
const FormData = require("form-data");
const { URLSearchParams } = require("url");
const fs = require("fs");
const { networkInterfaces } = require('os');
const HTMLParser = require('node-html-parser');

async function set_form_data(body,msg){
    form = new FormData();
//
    for(var key of Object.keys(body)){

        if(Array.isArray(body[key])){
            i=0
            for(var e of body[key]){
                i=i+1
                if(typeof e == 'object'){
                    for(var key2 of Object.keys(e)){
                        if (body[key]=="attatchment"){
                            var filename = await treat_attatchment(msg) 
                            var f = fs.readFileSync(filename)
                            form.append(key+'['+i+']'+'['+key2+']', f, filename)
                        }else{
                            form.append(key+'['+i+']'+'['+key2+']', e[key2])
                        }
                        
                    }
                }else{
                    if (body[key]=="attatchment"){
                        var filename = await treat_attatchment(msg) 
                        var f = fs.readFileSync(filename)
                        form.append(key+'['+i+']', f, filename)
                    }else{
                        form.append(key+'['+i+']', e)
                    }
                }
            }
        }else{
            if (body[key]=="attatchment"){
                var filename = await treat_attatchment(msg) 
                var f = fs.readFileSync(filename)
                form.append(key, f, filename)
            }else{
                form.append(key, body[key])
            }
            form.append(key, body[key])
        }
    }

    return form
}

async function req(dict,msg){
    const url = dict["url"]
    const cookies = dict["cookies"]
    const header = dict["header"]
    const body = dict["body"]
    const method = dict["method"]

    const new_cookies = [...Cookies,...cookies]

    const cookie = new_cookies.join('; ')

    const headers = {
        'Cookie': cookie,
        'user-agent': "Mozilla/5.0 (X11; CrOS x86_64 13505.73.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.109 Safari/537.36"
    };

    for (var key of Object.keys(header)){
        headers[key]=header[key]
    }

    var form

    if(dict["body_encode"]=="url"){
        form = createURLSearchParams(body);
    }else if(dict["body_encode"]=="multipart"){
        form = await set_form_data(body,msg)
    }

    var res;

    if(form!= undefined){
        res = await fetch(url,{method, headers , body:form})
    }else{
        res = await fetch(url,{method, headers})
    }

    var head = res.headers.raw()

    if(head["set-cookie"]!=undefined){
        for(var c of head["set-cookie"]){
            Cookies = [...Cookies,c.split(";")[0]]
        }
    }

    console.log(Cookies)

    bod = await res.text()
    //console.log(bod)
    bod = bod.replace(/"/g, "'")
    bod = bod.replace(/\n/g, "")
    bod = bod.replace(/\|/g, "%7C")
    return {"body":bod,"head":head}

}

async function treat_attatchment(msg){
    var keys =[ ...msg.attachments.keys() ];

    var url = msg.attachments.get(keys[0]).attachment
    const res = await fetch(url);

    var file_info = res.headers.raw()['content-disposition'][0].split(';')[1]

    var filename;

    eval(file_info)

    const arrayBuffer = await res.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filename, buffer);

    return filename

}


module.exports = async function addon(msg){
    await treat_attatchment(msg);
    await msg.reply({
        content: "test from addon"
    });
}

