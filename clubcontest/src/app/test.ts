/*import { async } from '@angular/core/testing';
export class engine {

    @workflow()
    async wf_4711(item, next) {
        
        
        this.sendMail();        
      
       

        

        switch(this.activity())
        {            
            case "":
                next = 1;
                break;
            case "":
                next = 2;
            case "event":
                var clone = item.Clone();
                this.wf_4711(clone, 3);         

        }
        
    }

    @plugin("1111")
    sendMail() {
    }

    @plugin("1111")
    activity():any{

    }

}


var items = [item]
switch(item.next)
{
    case 1: setStatus(item).exit(() => { next = 2 } break;
    case 2:  
        split(item)
        .exit(1, x => { confirmTeamLeader(x) });
        .exit(2, x => { confirmAdministration(x) })
    

}

plugin("aaa", clone)

var field = {# Ticket.Fields["bla"].Text #};

var activity = await activity("reviewOk") 
               with event continue plugin("111")
               option "ok" requires 1 continue with plugin("aaa");
               option "notOk" requires 100% continue with plugin(3);

*/






/*
*********************
class wf {

    start(prev: any[]) {
        prev.forEach((p) => {
            this.setStatus(p);
        })
    }

    @SetStatus("Neu")
    setStatusNeu(prev: any[]) {
        prev.forEach((p) => {

            this.split(p);
        })
    }

    @SetStatus("not ok admin")    
    setStatusNotAcceptedAdmin(prev: any) {
        prev.subscribe((p) => {
            this.stop(p)
        });
    }


    split(prev: any[]) {
        prev.forEach((p) => {
            var clone = p.clone();

            this.acceptTeamLeader(clone);
            this.acceptAdministration(p);
        })
    }

    acceptTeamLeader(prev: any[]) {
        prev.forEach((p) => {
            var result = p.createActivity();

            if (result = "ok") {
                this.waitjoin(p)
            }
            if (result = "notok") {
                this.stop(p)
            }
        })
    }

    acceptAdministration(prev: any[]) {
        prev.forEach((p) => {
            p.subscribe((pp) => {


                pp.createActivity().subscribe(result => {
                    if (result = "ok") {
                        this.waitjoin(p)
                    }
                    if (result = "notok") {
                        this.destroyOthers(p);
                    }
                });                                                                                                       


            });
        })
    }


    destroyOthers(prev[]) {
        prev.forEach(x => x.subscribe(y => {
            y.destroyOthers();
            this.setStatusNotAcceptedAdmin(y);
        }))
    }


    @In([])
    @Out()
    @WaitForAll()
    waitjoin(prev: any[]) {
        forkJoin(prev).subscribe((p) => {
            this.setStatus("accepted", p);
        })
    }

    stop(prev: any[]) {
    }


    run(){
        
    }




}
*/