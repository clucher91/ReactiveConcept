class OwnFramework {
    // Dependencias
    deps = new Map();

    constructor(options) {
        this.origen = options.data();
   
        const self = this;
        //Destino

        this.$data = new Proxy(this.origen, {
            get(target, name) {
                if (target[name]){
                    self.track(target, name);
                    return Reflect.get(target, name);
                }
                console.warn("La propiedad", name ,"no existe");
                return "";
            },
            set(target, name , value){
                Reflect.set(target, name , value);
                self.trigger(name);
            }
        });
    }

    mount() {
        document.querySelectorAll("*[p-text]").forEach(el => {
            this.pText(el, this.$data, el.getAttribute("p-text"));
        });

        document.querySelectorAll("*[p-bind]").forEach(el => {
            const [attr, name] = el.getAttribute("p-bind").match(/(\w+)/g);
            this.pBind(el, this.$data, name, attr);
        });

        document.querySelectorAll("*[p-model]").forEach(el => {
            const name = el.getAttribute("p-model");
            const attr = el.getAttribute("p-bind").split(":",1);

            this.pModel(el,this.$data, name);
            this.pBind(el,this.$data,name ,attr);

            el.addEventListener("input", () => {
                Reflect.set(this.$data, name, el.value ,attr);
            });
        });
    }

    track(target, name) {
        if( !this.deps.has(name)){
            const effect = () => {
                document.querySelectorAll(`*[p-text=${name}]`).forEach(el => {
                    this.pText(el, target, name);
                });

                document.querySelectorAll(`*[p-model=${name}]`).forEach(el => {
                    this.pModel(el, target, name);
                });

                document.querySelectorAll(`*[p-bind="src:${name}"]`).forEach(el => {
                    const [attr, name] = el.getAttribute('p-bind').match(/(\w+)/g)
                    this.pBind(el, this.$data, name, attr)
                });
                
            };

            this.deps.set(name, effect);
        }

    }

    trigger(name) {
        const effect = this.deps.get(name);
        effect();
    }

    pText(el, target, name) {
        el.innerText = Reflect.get(target, name);
    }

    pModel(el, target, name) {
        el.value = Reflect.get(target, name);
    }

    pBind(el, target, name , attr){
        el.setAttribute(attr, Reflect.get(target, name))
    }
}

var Own = {
    createApp(options) {
        return new OwnFramework(options);
    }
}
