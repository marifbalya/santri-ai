import { AIProvider, Message } from '../types';

export const sendMessageToPlaceholder = async (
  prompt: string,
  history: Message[], // Added history parameter
  provider: AIProvider,
  model: string,
  imageBase64?: string,
  currentCodeForModification?: string 
): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let responseText = `Respon dari ${provider} (model: ${model}): "${prompt}"`;
      if (history.length > 0) {
        responseText = `(Melihat riwayat ${history.length} pesan sebelumnya)\n` + responseText;
      }
      if (imageBase64) {
        responseText += ` (Gambar diterima dengan ${imageBase64.length} bytes data base64). Fitur vision untuk provider ini belum diimplementasikan sepenuhnya.`;
      }

      const isCodeGenerationRequest = prompt.toLowerCase().includes("kode") || 
                                    prompt.toLowerCase().includes("html") || 
                                    prompt.toLowerCase().includes("javascript") || 
                                    prompt.toLowerCase().includes("css") || 
                                    prompt.toLowerCase().includes("buatkan");
      
      const isOnlyCodeBlockInstruction = prompt.includes("Hasilkan HANYA blok kode mentah") || 
                                         prompt.includes("Provide ONLY the raw code block") ||
                                         prompt.includes("KODE YANG DIPERBARUI (HANYA KODE):");


      if (isCodeGenerationRequest && isOnlyCodeBlockInstruction) {
        let userRequest = "sesuatu yang keren";
        const userRequestMatchInitial = prompt.match(/Permintaan Pengguna: Buatkan kode untuk "(.*?)"/i);
        const userRequestMatchUpdate = prompt.match(/INSTRUKSI PENGGUNA: "(.*?)"/i);

        if (userRequestMatchInitial) userRequest = userRequestMatchInitial[1];
        if (userRequestMatchUpdate) userRequest = userRequestMatchUpdate[1];

        if (currentCodeForModification) {
            // Simulate code modification
            responseText = `<!-- Kode Asli Dimodifikasi -->
${currentCodeForModification}
<script>
  // Script ditambahkan atau diubah berdasarkan instruksi: ${userRequest}
  console.log("Kode placeholder dimodifikasi untuk: ${userRequest}");
  alert("Kode telah dimodifikasi oleh AI Placeholder!");
</script>
<style>
  /* Style ditambahkan atau diubah */
  .updated-by-ai { background-color: lightblue; padding: 5px; border: 1px dashed blue; }
</style>
<div class="updated-by-ai">Konten ini ditambahkan oleh AI setelah modifikasi berdasarkan: ${userRequest}.</div>`;
        } else {
            // Simulate initial code generation (potentially larger)
            responseText = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Placeholder: ${userRequest}</title>
<style>
  body { 
    font-family: Arial, sans-serif; 
    display: flex; 
    flex-direction: column;
    justify-content: center; 
    align-items: center; 
    min-height: 100vh; 
    background-color: #eef; 
    margin: 0; 
    padding: 20px;
    box-sizing: border-box;
  }
  .container { 
    padding: 30px; 
    background-color: #fff; 
    border-radius: 10px; 
    box-shadow: 0 5px 15px rgba(0,0,0,0.15); 
    text-align: center; 
    width: 100%;
    max-width: 600px;
  }
  h1 { color: #333; margin-bottom: 0.5em; }
  p { color: #555; line-height: 1.6; }
  button { 
    background-color: #007bff; 
    color: white; 
    padding: 10px 20px; 
    border: none; 
    border-radius: 5px; 
    cursor: pointer; 
    font-size: 16px;
    transition: background-color 0.3s ease;
  }
  button:hover { background-color: #0056b3; }
  .dynamic-content { margin-top: 20px; padding:10px; border: 1px solid #ccc; background-color: #f9f9f9; }
</style>
</head>
<body>
  <div class="container">
    <h1>Kode Placeholder Besar untuk: ${userRequest}</h1>
    <p>Ini adalah respon kode placeholder yang lebih besar dari ${provider} (model ${model}). Kode ini mencakup HTML, CSS inline, dan JavaScript inline.</p>
    <button id="myButton">Klik Saya!</button>
    <div id="dynamicArea" class="dynamic-content">Konten akan berubah di sini.</div>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    <p>Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam erat volutpat. Duis ac turpis. Integer rutrum ante eu lacus. </p>
  </div>
  <script>
    console.log("JavaScript placeholder untuk '${userRequest}' dijalankan.");
    const button = document.getElementById('myButton');
    const dynamicArea = document.getElementById('dynamicArea');
    let clickCount = 0;
    button.addEventListener('click', () => {
      clickCount++;
      dynamicArea.innerHTML = \`Tombol telah diklik \${clickCount} kali. Waktu: \${new Date().toLocaleTimeString()}\`;
      alert('Tombol Placeholder Ditekan! Ini adalah bagian dari kode yang besar.');
    });
  </script>
</body>
</html>`;
        }
      } else if (isCodeGenerationRequest) {
        // General prompt that might involve code, but not strict "only code"
         responseText = `Ini adalah placeholder teks yang mungkin berisi kode dari ${provider} (model ${model}) untuk permintaan: "${prompt}". \n\`\`\`html\n<p>Contoh kode placeholder.</p>\n\`\`\``;
      }


      resolve(responseText);
    }, 1000 + Math.random() * 500); // Simulate network delay
  });
};
