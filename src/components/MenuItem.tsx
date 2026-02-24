import React from 'react';
import { MenuItem as MenuItemType } from '../data/menu';

interface MenuItemProps {
    item: MenuItemType;
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
    return (
        <div className="relative w-full md:w-[287px] md:mt-[83px] group mx-auto shrink-0">
            
            {/* Mobile Layout (Visible only on small screens) */}
            <div className="flex md:hidden items-center w-full h-[110px] relative mb-2">
                {/* Green Card Background Pill */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[calc(100%-30px)] h-[84px] bg-hero-green rounded-full flex items-center pl-[85px] pr-[20px] shadow-md z-0">
                    <div className="flex flex-col justify-center overflow-hidden w-full">
                        <h3 className="text-[17px] font-black font-montserrat text-white uppercase leading-none truncate">
                            {item.title}
                        </h3>
                        {item.description && (
                            <div className="text-[10px] font-medium font-montserrat text-grey-black leading-[1.2] mt-1 line-clamp-2 whitespace-pre-line">
                                {item.description}
                            </div>
                        )}
                    </div>
                </div>

                {/* Image Container - Floating Left */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[104px] h-[104px] rounded-full bg-hero-blue-dark overflow-hidden shadow-lg z-10">
                    {/* Scale reference: Desktop circle is 250px. 104/250 = 0.416 */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] scale-[0.416] origin-center">
                        {item.layers ? (
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

            {/* Desktop Layout (Visible on md and larger) */}
            <div className="hidden md:flex flex-col items-center w-full relative">
                {/* Card Background */}
                <div className="bg-hero-green w-full rounded-[80px] pt-[200px] pb-[30px] px-[30px] flex flex-col items-center text-center relative z-0 shadow-lg min-h-[340px]">
                    
                    {/* Image Container - Floating above */}
                    <div className="absolute -top-[83px] left-1/2 transform -translate-x-1/2 w-[250px] h-[250px] rounded-full bg-hero-blue-dark overflow-hidden shadow-xl z-10 transition-transform duration-300 group-hover:scale-105">
                         {item.layers ? (
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
        </div>
    );
};

export default MenuItem;