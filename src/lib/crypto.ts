import CryptoJS from "crypto-js";

export const decrypt = (value: string) => {
  return CryptoJS.AES.decrypt(value, process.env.CRYPTO_SECRET!).toString(
    CryptoJS.enc.Utf8,
  );
};
