// Only explicitly supported provider codes may leave the server boundary.
export class SignupProviderError extends Error {
 constructor(public readonly code:string,public readonly status:number,message:string){super(message);}
}
export async function signupProviderError(response:Response):Promise<SignupProviderError>{
 const payload=await response.json().catch(()=>null);
 // GoTrue's legacy HTTP format uses error_code; newer responses use code.
 const code=typeof payload?.code==='string'?payload.code:payload?.error_code;
 switch(code){
  case 'over_email_send_rate_limit':
   return new SignupProviderError('over_email_send_rate_limit',429,"La limite d'envoi des confirmations est atteinte. Veuillez patienter avant une nouvelle inscription.");
  case 'email_address_not_authorized':
   return new SignupProviderError('email_address_not_authorized',503,"L'envoi de confirmation vers cette adresse n'est pas autorisé par le service de messagerie de recette.");
  case 'signup_disabled':
   return new SignupProviderError('signup_disabled',503,'Les inscriptions sont temporairement indisponibles.');
  case 'email_address_invalid':
   return new SignupProviderError('email_address_invalid',400,'Adresse e-mail invalide.');
  default:
   return new SignupProviderError('signup_provider_error',400,'Inscription impossible.');
 }
}
