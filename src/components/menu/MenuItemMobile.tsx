import React from 'react';
import { MenuItem as MenuItemType } from '../../data/menu';

interface MenuItemMobileProps {
  item: MenuItemType;
}

export const MenuItemMobile: React.FC<MenuItemMobileProps> = ({ item }) => {
  return (
    <div className="flex items-center w-full h-[110px] relative mb-2">
      {/* Green Card Background Pill */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[calc(100%-30px)] h-[84px] bg-hero-green rounded-full flex items-center pl-[85px] pr-[20px] shadow-md z-0">
        <div className="flex flex-col justify-center overflow-hidden w-full">
          <h3 className="text-[17px] font-black font-montserrat text-white uppercase leading-none truncate">
            {item.title}
          </h3>
          {item.description && (
            <div className="text-[10px] font-medium font-montserrat text-grey-black leading-[1.2] mt-1 line-clamp-2 whitespace-pre-line">
              {item.description.includes('Svinjski/Pileći/Mix:') ? (
                <>
                  {item.description.split('Svinjski/Pileći/Mix:')[0]}
                  <span className="font-bold">Svinjski/Pileći/Mix:</span>
                  {item.description.split('Svinjski/Pileći/Mix:')[1]}
                </>
              ) : (
                item.description
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Container - Floating Left */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[104px] h-[104px] rounded-full bg-hero-blue-dark overflow-hidden shadow-lg z-10">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] scale-[0.416] origin-center">
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
      </div>
    </div>
  );
};
