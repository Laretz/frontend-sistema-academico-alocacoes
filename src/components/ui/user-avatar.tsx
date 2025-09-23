import React from "react";
import avatar from "animal-avatar-generator";

interface UserAvatarProps {
  name: string;
  size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, size = 32 }) => {
  if (!name) {
    return (
      <div 
        className="rounded-full bg-transparent flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-gray-500 text-xs">?</span>
      </div>
    );
  }

  // Gera o avatar de animal baseado no nome
  let animalSvg = avatar(name, { size });
  
  // Força o SVG a usar o tamanho correto
  animalSvg = animalSvg.replace(/width="[^"]*"/g, `width="${size}"`);
  animalSvg = animalSvg.replace(/height="[^"]*"/g, `height="${size}"`);
  animalSvg = animalSvg.replace(/<svg/, `<svg style="width: ${size}px; height: ${size}px; display: block;"`);

  return (
    <div 
      className="rounded-full overflow-hidden"
      style={{ 
        width: size, 
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent !important',
        background: 'transparent !important',
        border: 'none',
        outline: 'none'
      }}
      dangerouslySetInnerHTML={{ __html: animalSvg }}
    />
  );
};

export default UserAvatar;
