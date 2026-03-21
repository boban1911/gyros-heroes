import React from 'react';
import { MenuItem as MenuItemType } from '../data/menu';
import MenuItem from './MenuItem';
import { useMenuFilter } from '../hooks/useMenuFilter';

import { Section } from './layout/Section';

const Menu: React.FC = () => {
    const { 
        activeCategory, 
        setActiveCategory, 
        filteredItems, 
        groupedItems, 
        categories 
    } = useMenuFilter();

    const { gyros: gyrosItems, sides: sidesItems, meals: mealsItems, kids: kidsItems } = groupedItems;

    // Helper to render grid
    const renderGrid = (items: MenuItemType[]) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 md:gap-8 justify-center justify-items-center">
            {items.map(item => (
                <MenuItem key={item.id} item={item} />
            ))}
        </div>
    );

    return (
        <Section 
            id="meni"
            className="bg-hero-yellow py-[60px] md:pt-[120px] md:pb-[60px]"
            containerClassName="flex flex-col"
        >
            {/* Title */}
            <div className="text-center mb-[60px] md:mb-[120px] relative z-20">
                <h2 className="text-5xl md:text-[120px] leading-none font-bold font-montserrat text-white tracking-[-6px]">
                    Pogledaj <span className="font-bold italic text-hero-blue-dark">Meni</span>
                </h2>
            </div>

            {/* Mobile Categories Tab Bar */}
            <div className="md:hidden flex overflow-x-auto space-x-4 px-4 pb-8 mb-4 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-6 py-2 rounded-full font-bold uppercase whitespace-nowrap transition-colors shadow-sm ${
                            activeCategory === cat.id 
                            ? 'bg-hero-blue-dark text-white' 
                            : 'bg-white text-hero-blue-dark'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Mobile View: Render Filtered List */}
            <div className="md:hidden mt-4" data-testid="menu-mobile">
                {renderGrid(filteredItems)}
            </div>

            {/* Desktop View: Specific Layout matching Figma */}
            <div className="hidden md:block space-y-[60px]" data-testid="menu-desktop">
                
                {/* 1. Gyros Section (Top) */}
                {(activeCategory === 'all' || activeCategory === 'gyros') && gyrosItems.length > 0 && (
                    <div className="relative">
                         <div className="relative w-full bg-hero-green rounded-[80px] pb-[30px] pt-[200px] px-[30px] shadow-xl mt-[250px]">
                            {/* Big Image Absolute Container with Blue Background */}
                             <div className="absolute -top-[150px] left-1/2 transform -translate-x-1/2 w-[90%] md:w-[500px] lg:w-[650px] h-[300px] z-10 pointer-events-none rounded-[60px] overflow-hidden bg-hero-blue-dark">
                                <img 
                                    src={gyrosItems[0]?.image} 
                                    alt="Gyros Hero" 
                                    className="absolute h-[216.67%] left-[9.63%] max-w-none top-[-65.37%] w-full object-cover" 
                                />
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] items-start">
                                {gyrosItems.map((item) => (
                                    <div key={item.id} className="flex flex-col gap-[10px] items-center text-center">
                                        <div className="flex h-[72px] items-center justify-center relative w-full">
                                            <div className="flex-none rotate-[-0.12deg]">
                                                <h3 className="text-[30px] leading-none font-black font-montserrat uppercase text-white whitespace-pre-wrap">
                                                    {item.title}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="text-[16px] font-medium font-montserrat text-grey-black leading-[1.2] whitespace-pre-wrap">
                                            <p className="font-bold mb-0">Svinjski/Pileći/Mix:</p>
                                            <p className="mb-0">Gyros meso, gyros pita, pomfrit</p>
                                            <p>+ 4 priloga po izboru</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                         </div>
                    </div>
                )}

                {/* 2. Sides Grid */}
                {(activeCategory === 'all' || activeCategory === 'sides') && sidesItems.length > 0 && (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 justify-center justify-items-center">
                             {sidesItems.map(item => <MenuItem key={item.id} item={item} />)}
                        </div>
                    </div>
                )}

                {/* 3. Meals Grid */}
                 {(activeCategory === 'all' || activeCategory === 'meals') && mealsItems.length > 0 && (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 justify-center justify-items-center">
                             {mealsItems.map(item => <MenuItem key={item.id} item={item} />)}
                        </div>
                    </div>
                )}

                {/* 4. Kids Section (Bottom) */}
                 {(activeCategory === 'all' || activeCategory === 'kids') && kidsItems.length > 0 && (
                     <div className="flex justify-center">
                         {kidsItems.map(item => (
                             <div key={item.id} className="relative w-[654px] h-[250px]">
                                 {/* Green Card Background */}
                                 <div className="absolute top-[calc(50%+0.23px)] left-[90px] -translate-y-1/2 w-[564px] h-[175px] bg-hero-green rounded-[80px] flex items-center pl-[180px] pr-[30px] shadow-xl">
                                     <div className="flex flex-col gap-[10px] items-start w-full">
                                         <div className="w-full">
                                             <h3 className="text-[30px] font-black font-montserrat text-white uppercase leading-[1.2] whitespace-pre-wrap">
                                                 {item.title}
                                             </h3>
                                         </div>
                                         <div className="text-[14px] font-medium font-montserrat text-grey-black leading-[1.2] whitespace-nowrap">
                                             <p className="font-bold mb-0">Nuggets Obrok:</p>
                                             <p className="mb-0">6 Nuggetsa, pomfrit, sok od jabuke + poklon</p>
                                             <p className="font-bold mb-0">Gyros Obrok:</p>
                                             <p>Kids Hero Gyros, pomfrit, sok od jabuke + poklon</p>
                                         </div>
                                     </div>
                                 </div>

                                 {/* Image Container - Floating Left */}
                                 <div className="absolute left-0 top-0 w-[250px] h-[250px] rounded-full bg-hero-blue-dark overflow-hidden shadow-2xl z-20">
                                    <img 
                                        src={item.image} 
                                        alt={item.title} 
                                        className="absolute h-[86.11%] left-[5.44%] max-w-none top-[15.2%] w-[89.12%] object-contain" 
                                    />
                                 </div>
                             </div>
                         ))}
                    </div>
                )}

            </div>
        </Section>
    );
};

export default Menu;
