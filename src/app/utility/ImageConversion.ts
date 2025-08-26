import { Observable } from "rxjs";

// Image to Base 64
export function convertFile(file: any){
    const reader = new FileReader();
    const binaryString = reader.readAsDataURL(file?.target?.files[0]);
    reader.onload = (event: any) => {
      //  console.log('Image in Base64: ', event.target.result);
        var base64String =  event.target.result;
        return base64String;
    };
    reader.onerror = (event: any) => {
        console.log("File could not be read: " + event.target.error.code);
        return event.target.error.code;
    };
}