import * as fs from 'fs';

export async function addon(command, msg) {
   dict = JSON.parse(msg.cleanContent.replace(/@\S*?\s/, '').trim())
   try{
     res = await addon_req(dict,msg)
     fs.writeFileSync('header',JSON.stringify(res["head"]), 'utf8')
     fs.writeFileSync('body',res["body"], 'utf8')
   }catch(e){
     console.log(e)
     await msg.reply("Err: set the member in the command ");
     return;
   }
   await msg.reply({
       content: "result: ", 
       files: [{ 
           name: 'header', 
           attachment: './header' // path or buffer
       },{ 
           name: 'body', 
           attachment: './body' // path or buffer
       }] 
   });

}

async function addon_req(command, msg) {
        const body = command["body"]

        const new_cookies = [...command.cookies ?? []]

        const cookie = new_cookies.join('; ')

        const headers = {
            'Cookie': cookie,
            'user-agent': "Mozilla/5.0 (X11; CrOS x86_64 13505.73.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.109 Safari/537.36"
        };

        for (var key of Object.keys(command.header ?? {})){
            headers[key]=command.header[key]
        }

        var form

        if(command.body_encode=="url"){
            form = createURLSearchParams(body);
        }else if(command.body_encode=="multipart"){
            form = await addon_set_form_data(command.body,msg)
        }
    
        var res;

        console.log("cookie",cookie)

        if (command.url != undefined ){
            res = await fetch(command.url, {method: command.method ?? 'GET', headers , body:form,redirect: 'manual' })
        }

        var head = {}
        res?.headers.forEach((value, key) => {
            head[key] = (head[key] || '') +'`'+ value;
            console.log(`${key}: ${value}`);
        });

        if (head?.["set-cookie"] != undefined){
            var tmp_cookies = head?.["set-cookie"]?.split("`").filter((line)=>line.trim().length>0).map((line) => line.split(";")[0])
            command.cookies.push(...tmp_cookies)
        }

        var body_text = await res?.text()

        return {
            head: head,
            body: body_text
        }
    }

    async function addon_set_form_data(body, msg) {
        var form = new FormData();
//
        for(var key of Object.keys(body)){

            if(Array.isArray(body[key])){
                var i=0
                for(var e of body[key]){
                    i=i+1
                    if(typeof e == 'object'){
                        for(var key2 of Object.keys(e)){
                            if (body[key]=="attatchment"){
                                var filename = await addon_treat_attatchment(msg) 
                                var f = fs.readFileSync(filename)
                                const blob = new Blob([f], { type: 'application/octet-stream' });
                                form.append(key+'['+i+']'+'['+key2+']', blob, filename)
                            }else{
                                form.append(key+'['+i+']'+'['+key2+']', e[key2])
                            }

                        }
                    }else{
                        if (body[key]=="attatchment"){
                            var filename = await addon_treat_attatchment(msg) 
                            var f = fs.readFileSync(filename)
                            const blob = new Blob([f], { type: 'application/octet-stream' });
                            form.append(key+'['+i+']', blob, filename)
                        }else{
                            form.append(key+'['+i+']', e)
                        }
                    }
                }
            }else{
                if (body[key]=="attatchment"){
                    var filename = await addon_treat_attatchment(msg) 
                    var f = fs.readFileSync(filename)
                    const blob = new Blob([f], { type: 'application/octet-stream' });
                    form.append(key, blob, filename)
                }else{
                    form.append(key, body[key])
                }
                // form.append(key, body[key])
            }
        }
        return form;
    }

    async function addon_treat_attatchment(msg){
        var keys =[ ...msg.attachments.keys() ];
        var url = msg.attachments.get(keys[0]).attachment
        const res = await fetch(url);

        var file_info = res.headers.get('content-disposition')?.split(';')[1]

        var filename = file_info.split('=')[1]?.replace(/"/g, '');

        const arrayBuffer = await res.arrayBuffer();

        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filename, buffer);

        return filename

    }
const createURLSearchParams = (data) => {
  const params = new URLSearchParams();
  Object.keys(data).forEach(key => params.append(key, data[key]));
  return params;
}
