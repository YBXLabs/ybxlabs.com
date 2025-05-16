import{ab as e}from"../routes/renderer.mjs";import{u as t}from"../build/server.mjs";function useSeoMeta(r,a){const{title:o,titleTemplate:s,...l}=r;return t({title:o,titleTemplate:s,_flatMeta:l},{...a,transform(t){const r=e({...t._flatMeta});return delete t._flatMeta,{...t,meta:r}}})}export{useSeoMeta as u};
//# sourceMappingURL=index.mjs.map
