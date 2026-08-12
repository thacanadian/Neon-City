export class SaveSystem{
constructor(game){this.game=game;this.key='neonCityV10Save';this.defaults={cash:0,skill:0,unlocks:{pistol:true,smg:false,shotgun:false,sniper:false,minigun:false},upgrades:{maxHp:0,armor:0,car:0,grenades:0,damage:0}};this.data=this.load();}
load(){try{const raw=JSON.parse(localStorage.getItem(this.key)||'{}');return this.merge(this.defaults,raw)}catch{return JSON.parse(JSON.stringify(this.defaults))}}
merge(a,b){const out=Array.isArray(a)?[]:{...a};for(const k in b){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k]))out[k]=this.merge(a[k]||{},b[k]);else out[k]=b[k]}return out}
save(){localStorage.setItem(this.key,JSON.stringify(this.data));}
addCash(n){this.data.cash+=n;this.save();}
addSkill(n){this.data.skill+=n;this.save();}
buyRandom(){let d=this.data;if(d.cash<250)return false;d.cash-=250;const picks=['maxHp','armor','car','grenades','damage'];const p=picks[Math.floor(Math.random()*picks.length)];d.upgrades[p]=(d.upgrades[p]||0)+1;if(d.upgrades.damage>=1)d.unlocks.smg=true;if(d.upgrades.damage>=2)d.unlocks.shotgun=true;if(d.upgrades.damage>=3)d.unlocks.sniper=true;if(d.upgrades.damage>=4)d.unlocks.minigun=true;this.save();return p;}
}
