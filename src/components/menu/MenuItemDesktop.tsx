import React from 'react';
import { MenuItem as MenuItemType } from '../../data/menu';

interface MenuItemDesktopProps {
  item: MenuItemType;
}

export const MenuItemDesktop: React.FC<MenuItemDesktopProps> = ({ item }) => {
  return (
    <div className="flex flex-col items-center w-full relative">
      {/* Card Background */}
      <div className="bg-hero-green w-full rounded-[80px] pt-[200px] pb-[30px] px-[30px] flex flex-col items-center text-center relative z-0 shadow-lg min-h-[340px]">
        {/* Image Container - Floating above */}
        <div className="absolute -top-[83px] left-1/2 transform -translate-x-1/2 w-[250px] h-[250px] rounded-full bg-hero-blue-dark overflow-hidden shadow-xl z-10 transition-transform duration-base group-hover:scale-105">
          {item.type === 'layered' ? (
            item.layers.map((layer, index) => (
              <img
                key={index}
                src={layer.src}
                alt=""
                className={layer.className}
              />
            ))
          ) : (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover origin-center"
              style={{ transform: `scale(${item.scale || '1.35'})` }}
            />
          )}
        </div>

        {/* Content */}
        <div className="mt-auto w-full flex flex-col items-center">
          <h3 className="text-2xl font-black font-montserrat text-white uppercase leading-tight drop-shadow-md break-words w-full">
            {item.title}
          </h3>

          {item.description && (
            <p className="text-sm font-medium font-montserrat text-grey-black leading-[1.2] mt-4">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
