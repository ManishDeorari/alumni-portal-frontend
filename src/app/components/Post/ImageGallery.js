// components/Post/ImageGallery.js
export default function ImageGallery({ images, onImageClick }) {
  if (!images?.length) return null;

  return (
    <div className="mt-2 flex gap-2 overflow-x-auto max-w-full">
      {images.map((image, index) => (
        <img
          key={index}
          src={image.url} // ✅ fix here
          alt={`image-${index}`}
          className="h-48 w-auto rounded-lg border cursor-pointer object-contain"
          onClick={() => onImageClick(index)}
        />
      ))}
    </div>
  );
}
