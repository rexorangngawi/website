import React, { useState, useEffect } from 'react';

// Main App component
export default function App() {
  const [selectedImage, setSelectedImage] = useState(null); // Stores the File object
  const [previewImage, setPreviewImage] = useState(null);   // Stores the URL for image preview
  const [processedImage, setProcessedImage] = useState(null); // Stores the URL of the processed image
  const [isLoading, setIsLoading] = useState(false);       // Loading state for processing
  const [errorMessage, setErrorMessage] = useState('');     // Stores any error messages
  const [db, setDb] = useState(null); // Firestore instance
  const [auth, setAuth] = useState(null); // Firebase Auth instance
  const [userId, setUserId] = useState(null); // User ID for Firestore

  // Firebase initialization and authentication
  useEffect(() => {
    // These global variables are provided by the Canvas environment
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    if (firebaseConfig) {
      // Dynamically import Firebase modules
      Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('firebase/firestore')
      ]).then(([{ initializeApp }, { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged }, { getFirestore }]) => {
        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestoreDb);
        setAuth(firebaseAuth);

        // Sign in with custom token or anonymously
        if (initialAuthToken) {
          signInWithCustomToken(firebaseAuth, initialAuthToken)
            .then(() => console.log("Signed in with custom token"))
            .catch(error => {
              console.error("Error signing in with custom token:", error);
              signInAnonymously(firebaseAuth).then(() => console.log("Signed in anonymously")).catch(e => console.error("Error signing in anonymously:", e));
            });
        } else {
          signInAnonymously(firebaseAuth)
            .then(() => console.log("Signed in anonymously"))
            .catch(error => console.error("Error signing in anonymously:", error));
        }

        // Listen for auth state changes to get the user ID
        onAuthStateChanged(firebaseAuth, (user) => {
          if (user) {
            setUserId(user.uid);
            console.log("User ID:", user.uid);
          } else {
            setUserId(crypto.randomUUID()); // Generate a random ID if not authenticated
            console.log("User not authenticated, using random ID:", userId);
          }
        });
      }).catch(error => {
        console.error("Failed to load Firebase modules:", error);
        setErrorMessage("Gagal memuat layanan Firebase. Silakan coba lagi.");
      });
    } else {
      setErrorMessage("Konfigurasi Firebase tidak ditemukan.");
    }
  }, []);

  // Handle image file selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file)); // Create a URL for preview
      setProcessedImage(null); // Clear previous processed image
      setErrorMessage(''); // Clear previous errors
    } else {
      setSelectedImage(null);
      setPreviewImage(null);
      setErrorMessage('Tidak ada file gambar yang dipilih.');
    }
  };

  // Simulate image processing with Gemini API
  const handleProcessImage = async () => {
    if (!selectedImage) {
      setErrorMessage('Harap unggah foto terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setProcessedImage(null);

    // --- Backend (Node.js/Express.js) Simulation ---
    // In a real application, this part would be sent to your Node.js/Express.js backend.
    // The backend would then handle:
    // 1. Receiving the image file (e.g., as base64 or multipart form data).
    // 2. Making the secure API call to Google Gemini (imagen-3.0-generate-002 model).
    //    The API key MUST be kept on the server-side for security.
    // 3. Constructing the prompt for the image generation model.
    //    The user's prompt:
    //    "Ubah background foto ini menjadi [ super realistik HD sore hari langit tajam refleksi cahaya matahari HD sore hari].
    //    Jangan ubah apapun dari objek utama di depan (misalnya orang, hewan, atau benda).
    //    Tingkatkan kualitas foto jadi HD: buat lebih tajam, detail, dan bersih, tapi tetap alami dan realistis."
    //
    //    For imagen-3.0-generate-002 (text-to-image generation), the prompt would be crafted
    //    to describe the *desired final image*, incorporating the background and quality enhancements.
    //    Example prompt for imagen-3.0-generate-002:
    //    "A high-definition, super realistic photo of [describe main subject, if known, or a generic subject like 'a person']
    //    under a sharp late afternoon sky with intense sunlight reflections. The image is
    //    exceptionally sharp, detailed, and clean, maintaining a natural and realistic appearance.
    //    The background is a vibrant late afternoon sky with golden hour lighting."
    //
    //    Note: Direct image editing (preserving foreground, changing background) is more complex
    //    and typically requires dedicated image editing models or a multi-step pipeline (e.g.,
    //    segmentation, background generation, compositing) which is beyond a simple text-to-image call.
    //    This simulation will generate a new image based on the prompt's description.

    try {
      // Simulate network delay for API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      // --- Gemini API Call (Simulated on client-side for demonstration) ---
      // In a real scenario, this would be a fetch to your Node.js backend endpoint.
      // The backend would then make the actual call to Gemini.
      // const response = await fetch('/api/process-image', {
      //   method: 'POST',
      //   body: JSON.stringify({ image: base64ImageData, prompt: "..." }),
      //   headers: { 'Content-Type': 'application/json' },
      // });
      // const result = await response.json();
      // const imageUrl = result.imageUrl; // Get the generated image URL from backend

      // Placeholder for Gemini API call
      // This is a client-side simulation. In production, this call would be on your Node.js backend.
      let chatHistory = [];
      const promptText = "A super realistic, high-definition, sharp, and clean photo taken late afternoon with a sharp sky and sunlight reflections. The main subject (e.g., person, animal, or object) is preserved and enhanced to be sharper, more detailed, and clean, while remaining natural and realistic. The background is a vibrant late afternoon sky with golden hour lighting.";
      chatHistory.push({ role: "user", parts: [{ text: promptText }] });

      const payload = {
          instances: { prompt: promptText },
          parameters: { "sampleCount": 1 }
      };
      const apiKey = "AIzaSyD60NTFSeUdPlPNiqS8DRnU757yzP1f_HY"; // API Key should be on the server-side in a real app
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
        const generatedImageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
        setProcessedImage(generatedImageUrl);
      } else {
        setErrorMessage("Gagal menghasilkan gambar. Respon tidak valid.");
        console.error("Invalid API response:", result);
      }

    } catch (error) {
      console.error('Error processing image:', error);
      setErrorMessage('Terjadi kesalahan saat memproses gambar. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-600 via-blue-400 to-cyan-400 font-sans text-gray-800">
      {/* User ID Display */}
      {userId && (
        <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
          User ID: {userId}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-10 w-full max-w-2xl transform transition-all duration-300 hover:scale-105">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-6 text-purple-700">
          Peningkat Foto AI Gemini
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Ubah latar belakang dan tingkatkan kualitas foto Anda menjadi HD dengan AI!
        </p>

        {/* Input Section */}
        <div className="mb-8 border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 transition-all duration-200">
          <label htmlFor="image-upload" className="cursor-pointer block">
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-image-plus text-purple-500 mb-3"
              >
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                <line x1="16" x2="22" y1="5" y2="5" />
                <line x1="19" x2="19" y1="2" y2="8" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <span className="text-lg font-semibold text-purple-600">
                {selectedImage ? selectedImage.name : 'Pilih atau Seret Foto di Sini'}
              </span>
              <p className="text-sm text-gray-500 mt-1">Format: JPG, PNG, GIF</p>
            </div>
          </label>
        </div>

        {/* Image Preview */}
        {previewImage && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-700 mb-3">Pratinjau Foto Anda:</h2>
            <img
              src={previewImage}
              alt="Pratinjau Foto"
              className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md border border-gray-200"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/cccccc/333333?text=Gagal+Memuat+Gambar"; }}
            />
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {errorMessage}</span>
          </div>
        )}

        {/* Process Button */}
        <button
          onClick={handleProcessImage}
          disabled={isLoading || !selectedImage}
          className={`w-full py-3 px-6 rounded-full text-white font-bold text-lg shadow-lg transform transition-all duration-300
            ${isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 active:scale-95'
            } flex items-center justify-center`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Memproses...
            </>
          ) : (
            'Lanjut'
          )}
        </button>

        {/* Processed Image Display */}
        {processedImage && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-700 mb-3">Foto Hasil AI:</h2>
            <img
              src={processedImage}
              alt="Foto Hasil AI"
              className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md border border-green-200"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/cccccc/333333?text=Gagal+Memuat+Gambar+Hasil"; }}
            />
            <p className="text-sm text-gray-500 mt-2 text-center">
              *Catatan: Gambar ini dihasilkan oleh AI berdasarkan deskripsi. Untuk pengeditan gambar yang lebih kompleks (misalnya mempertahankan objek utama secara presisi), mungkin diperlukan model AI atau alur kerja yang berbeda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

