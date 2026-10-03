import { PRODUCT } from './config.js';
import { state } from './state.js';
import { openModal } from './ui.js';
import { recordActivity } from './analytics.js';

export function initProduct(){
 const buy=document.querySelector('[data-buy-button]'); if(!buy)return;
 buy.addEventListener('click',()=>{
  if(!state.unlocked)return;
  recordActivity('purchase','Purchase Center opened',PRODUCT.title);
  if(PRODUCT.checkoutUrl&&PRODUCT.checkoutUrl!=='#'){window.location.href=PRODUCT.checkoutUrl;return;}
  openModal({title:'Purchase Center',body:'Your product is unlocked. Review the purchase details and use the configured payment confirmation flow.',icon:'shopping-bag',details:`${PRODUCT.title}\nAmount: ${PRODUCT.price.toFixed(2)} ${PRODUCT.currency}\nStatus: ${state.purchaseStatus.replace('_',' ')}`});
 });
}
