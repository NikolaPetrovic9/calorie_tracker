// =================================================================
// ULTIMATIVNA BAZA NAMIRNICA - SRBIJA (CLEAN VERZIJA)
// Format: JavaScript Array of Objects
// Vrednosti su na 100g (ili 100ml) osim ako piše 'kom'
// =================================================================

const foods = [

    // ==================================================
    // 1. HLEB, PECIVA I ŽITARICE (OSNOVNO)
    // ==================================================
    { name: 'Beli hleb', calories: 265, protein: 9, fat: 3.2, carbs: 49, serving: 100, unit: 'g' },
    { name: 'Polubeli hleb (Sava)', calories: 250, protein: 8.5, fat: 1.5, carbs: 50, serving: 100, unit: 'g' },
    { name: 'Crni hleb (ražani)', calories: 250, protein: 8, fat: 1, carbs: 52, serving: 100, unit: 'g' },
    { name: 'Integralni hleb', calories: 247, protein: 10, fat: 3.5, carbs: 45, serving: 100, unit: 'g' },
    { name: 'Tonus hleb (bez brašna)', calories: 245, protein: 13, fat: 4, carbs: 40, serving: 100, unit: 'g' },
    { name: 'Tost hleb (beli)', calories: 260, protein: 8, fat: 3, carbs: 50, serving: 100, unit: 'g' },
    { name: 'Tost hleb (integralni)', calories: 250, protein: 9, fat: 4, carbs: 45, serving: 100, unit: 'g' },
    { name: 'Kifla (pekarska)', calories: 290, protein: 8, fat: 5, carbs: 55, serving: 1, unit: 'kom' },
    { name: 'Đevrek (sa susamom)', calories: 300, protein: 9, fat: 6, carbs: 52, serving: 1, unit: 'kom' },
    { name: 'Pereca (pekarska)', calories: 320, protein: 9, fat: 4, carbs: 60, serving: 1, unit: 'kom' },
    { name: 'Somun / Lepinja', calories: 250, protein: 8, fat: 1, carbs: 52, serving: 100, unit: 'g' },
    { name: 'Tortilla (pšenična)', calories: 312, protein: 8, fat: 8, carbs: 52, serving: 100, unit: 'g' },
    { name: 'Kore za pitu (tanke)', calories: 290, protein: 9, fat: 1, carbs: 60, serving: 100, unit: 'g' },
    { name: 'Lisnato testo (sirovo, smrznuto)', calories: 558, protein: 7, fat: 38, carbs: 46, serving: 100, unit: 'g' },
    { name: 'Prezle', calories: 395, protein: 13, fat: 5, carbs: 72, serving: 100, unit: 'g' },

    // Žitarice i Testenine
    { name: 'Palenta (kukuruzni griz, sirova)', calories: 360, protein: 7, fat: 1, carbs: 77, serving: 100, unit: 'g' },
    { name: 'Palenta (kuvana na vodi)', calories: 70, protein: 1.5, fat: 0.2, carbs: 15, serving: 100, unit: 'g' },
    { name: 'Pšenični griz (sirov)', calories: 360, protein: 11, fat: 1, carbs: 73, serving: 100, unit: 'g' },
    { name: 'Pirinač (beli, sirov)', calories: 360, protein: 7, fat: 0.6, carbs: 80, serving: 100, unit: 'g' },
    { name: 'Pirinač (beli, kuvan)', calories: 130, protein: 2.7, fat: 0.3, carbs: 28, serving: 100, unit: 'g' },
    { name: 'Integralni pirinač (sirov)', calories: 362, protein: 7.5, fat: 2.7, carbs: 76, serving: 100, unit: 'g' },
    { name: 'Ovsene pahuljice', calories: 367, protein: 14, fat: 7, carbs: 66, serving: 100, unit: 'g' },
    { name: 'Kornfleks', calories: 370, protein: 7, fat: 0.5, carbs: 84, serving: 100, unit: 'g' },
    { name: 'Musli (klasičan)', calories: 370, protein: 10, fat: 7, carbs: 65, serving: 100, unit: 'g' },
    { name: 'Makarone / Testenina (sirova)', calories: 371, protein: 13, fat: 1.5, carbs: 75, serving: 100, unit: 'g' },
    { name: 'Makarone (kuvane)', calories: 158, protein: 5.8, fat: 0.9, carbs: 31, serving: 100, unit: 'g' },
    { name: 'Nudle (samo testo)', calories: 450, protein: 9, fat: 18, carbs: 62, serving: 100, unit: 'g' },
    { name: 'Kinoa (sirova)', calories: 368, protein: 14, fat: 6, carbs: 64, serving: 100, unit: 'g' },
    { name: 'Kuskus (sirov)', calories: 376, protein: 13, fat: 0.6, carbs: 77, serving: 100, unit: 'g' },

    // Brašna (za recepte)
    { name: 'Pšenično brašno (belo)', calories: 364, protein: 10, fat: 1, carbs: 76, serving: 100, unit: 'g' },
    { name: 'Integralno brašno', calories: 340, protein: 13, fat: 2.5, carbs: 72, serving: 100, unit: 'g' },
    { name: 'Kukuruzno brašno', calories: 360, protein: 7, fat: 3, carbs: 77, serving: 100, unit: 'g' },

    // ==================================================
    // 2. MESO (SIROVO) I PRERAĐEVINE
    // ==================================================
    // Piletina i Ćuretina
    { name: 'Pileća prsa (bez kože)', calories: 110, protein: 23, fat: 1.2, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Pileći batak (bez kože)', calories: 120, protein: 19, fat: 4, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Pileći batak (sa kožom)', calories: 214, protein: 16, fat: 15, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Pileća krilca', calories: 203, protein: 17, fat: 14, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Pileća džigerica', calories: 116, protein: 17, fat: 4.8, carbs: 1, serving: 100, unit: 'g' },
    { name: 'Ćureća prsa', calories: 104, protein: 24, fat: 1, carbs: 0, serving: 100, unit: 'g' },
    
    // Svinjetina
    { name: 'Svinjski but (posni)', calories: 143, protein: 21, fat: 6, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Svinjski vrat', calories: 230, protein: 17, fat: 18, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Svinjska krmenadla', calories: 155, protein: 21, fat: 7, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Svinjski file (lungić)', calories: 120, protein: 21, fat: 3.5, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Svinjska rebra', calories: 290, protein: 15, fat: 25, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Mleveno svinjsko', calories: 263, protein: 17, fat: 21, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Svinjska mast', calories: 900, protein: 0, fat: 100, carbs: 0, serving: 100, unit: 'g' },
    
    // Junetina
    { name: 'Juneći but (posni)', calories: 135, protein: 22, fat: 4.5, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Juneća plećka', calories: 180, protein: 20, fat: 11, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Mleveno juneće', calories: 176, protein: 20, fat: 10, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Mleveno mešano', calories: 254, protein: 17, fat: 20, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Teletina (but)', calories: 115, protein: 21, fat: 3, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Goveđa džigerica', calories: 135, protein: 20, fat: 3.6, carbs: 3.8, serving: 100, unit: 'g' },
    
    // Suhomesnato (Kupovno)
    { name: 'Pileća prsa (u omotu)', calories: 95, protein: 18, fat: 2, carbs: 1, serving: 100, unit: 'g' },
    { name: 'Šunka (stisnjena/pizza)', calories: 110, protein: 19, fat: 3, carbs: 1, serving: 100, unit: 'g' },
    { name: 'Pečenica', calories: 155, protein: 23, fat: 7, carbs: 1, serving: 100, unit: 'g' },
    { name: 'Suvi vrat', calories: 250, protein: 18, fat: 19, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Pršuta (svinjska)', calories: 240, protein: 29, fat: 13, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Slanina (Panceta)', calories: 541, protein: 11, fat: 53, carbs: 1, serving: 100, unit: 'g' },
    { name: 'Slanina (domaća)', calories: 450, protein: 15, fat: 42, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Čajna kobasica', calories: 430, protein: 16, fat: 39, carbs: 2, serving: 100, unit: 'g' },
    { name: 'Kulen', calories: 380, protein: 18, fat: 34, carbs: 2, serving: 100, unit: 'g' },
    { name: 'Mortadela', calories: 311, protein: 12, fat: 25, carbs: 3, serving: 100, unit: 'g' },
    { name: 'Parizer', calories: 260, protein: 11, fat: 22, carbs: 4, serving: 100, unit: 'g' },
    { name: 'Viršle (pileće)', calories: 240, protein: 11, fat: 18, carbs: 3, serving: 100, unit: 'g' },
    { name: 'Čvarci', calories: 524, protein: 40, fat: 40, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Pašteta (Argeta tip)', calories: 290, protein: 11, fat: 26, carbs: 3, serving: 100, unit: 'g' },

    // ==================================================
    // 3. RIBA I KONZERVE
    // ==================================================
    { name: 'Tunjevina (salamura/voda)', calories: 116, protein: 26, fat: 0.8, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Tunjevina (u ulju, oceđena)', calories: 198, protein: 27, fat: 9, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Sardina (u ulju)', calories: 208, protein: 25, fat: 11, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Oslić', calories: 82, protein: 18, fat: 0.7, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Pastrmka', calories: 148, protein: 21, fat: 7, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Šaran', calories: 127, protein: 18, fat: 5.6, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Som', calories: 115, protein: 16, fat: 5, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Losos', calories: 208, protein: 20, fat: 13, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Skuša', calories: 205, protein: 19, fat: 14, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Lignje', calories: 92, protein: 16, fat: 1.4, carbs: 3, serving: 100, unit: 'g' },
    { name: 'Riblji štapići', calories: 220, protein: 12, fat: 10, carbs: 20, serving: 100, unit: 'g' },

    // ==================================================
    // 4. MLEČNI PROIZVODI I JAJA
    // ==================================================
    { name: 'Jaje (M veličina)', calories: 72, protein: 6.3, fat: 4.8, carbs: 0.4, serving: 1, unit: 'kom' },
    { name: 'Jaje (L veličina)', calories: 78, protein: 7, fat: 5.3, carbs: 0.6, serving: 1, unit: 'kom' },
    { name: 'Belance (1 kom)', calories: 17, protein: 3.6, fat: 0.1, carbs: 0.2, serving: 1, unit: 'kom' },
    
    { name: 'Jogurt (2.8% mm)', calories: 57, protein: 3.5, fat: 2.8, carbs: 4.5, serving: 100, unit: 'g' },
    { name: 'Jogurt (1% mm)', calories: 40, protein: 3.4, fat: 0.5, carbs: 4.3, serving: 100, unit: 'g' },
    { name: 'Grčki jogurt', calories: 130, protein: 5, fat: 10, carbs: 4, serving: 100, unit: 'g' },
    { name: 'Kiselo mleko', calories: 62, protein: 3.2, fat: 3.2, carbs: 4.5, serving: 100, unit: 'g' },
    { name: 'Kefir', calories: 50, protein: 3.4, fat: 2.5, carbs: 4.7, serving: 100, unit: 'g' },
    { name: 'Mleko (2.8% mm)', calories: 57, protein: 3.2, fat: 2.8, carbs: 4.7, serving: 100, unit: 'ml' },
    { name: 'Čokoladno mleko', calories: 85, protein: 3, fat: 3, carbs: 11, serving: 100, unit: 'ml' },
    
    // Sirevi
    { name: 'Ella sir (0% masti)', calories: 60, protein: 12, fat: 0.5, carbs: 2, serving: 100, unit: 'g' },
    { name: 'Sitan sir (posni)', calories: 85, protein: 13, fat: 1, carbs: 3, serving: 100, unit: 'g' },
    { name: 'Sitan sir (punomasni)', calories: 160, protein: 11, fat: 10, carbs: 3, serving: 100, unit: 'g' },
    { name: 'Feta sir', calories: 264, protein: 14, fat: 21, carbs: 4, serving: 100, unit: 'g' },
    { name: 'Sjenički sir', calories: 300, protein: 15, fat: 25, carbs: 2, serving: 100, unit: 'g' },
    { name: 'Kačkavalj (Gauda/Edamer)', calories: 356, protein: 25, fat: 27, carbs: 2, serving: 100, unit: 'g' },
    { name: 'Mocarela', calories: 280, protein: 28, fat: 17, carbs: 3, serving: 100, unit: 'g' },
    { name: 'Parmezan', calories: 431, protein: 38, fat: 29, carbs: 4, serving: 100, unit: 'g' },
    { name: 'Kajmak', calories: 380, protein: 4, fat: 40, carbs: 2, serving: 100, unit: 'g' },
    { name: 'Pavlaka (20% mm)', calories: 205, protein: 2.5, fat: 20, carbs: 3, serving: 100, unit: 'g' },
    { name: 'Pavlaka za kuvanje', calories: 300, protein: 2.5, fat: 30, carbs: 3, serving: 100, unit: 'ml' },
    { name: 'Maslac (Puter)', calories: 717, protein: 0.9, fat: 81, carbs: 0.1, serving: 100, unit: 'g' },
    { name: 'Margarin', calories: 717, protein: 0.2, fat: 80, carbs: 0.7, serving: 100, unit: 'g' },
    
    // ==================================================
    // 5. POVRĆE
    // ==================================================
    { name: 'Krompir (sirov)', calories: 77, protein: 2, fat: 0.1, carbs: 17, serving: 100, unit: 'g' },
    { name: 'Pomfrit (smrznuti, sirov)', calories: 150, protein: 3, fat: 5, carbs: 24, serving: 100, unit: 'g' },
    { name: 'Batat', calories: 86, protein: 1.6, fat: 0.1, carbs: 20, serving: 100, unit: 'g' },
    { name: 'Paradajz', calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, serving: 100, unit: 'g' },
    { name: 'Krastavac', calories: 15, protein: 0.7, fat: 0.1, carbs: 3.6, serving: 100, unit: 'g' },
    { name: 'Paprika (sveža)', calories: 31, protein: 1, fat: 0.3, carbs: 6, serving: 100, unit: 'g' },
    { name: 'Luk (crni)', calories: 40, protein: 1.1, fat: 0.1, carbs: 9, serving: 100, unit: 'g' },
    { name: 'Beli luk', calories: 149, protein: 6.4, fat: 0.5, carbs: 33, serving: 100, unit: 'g' },
    { name: 'Šargarepa', calories: 41, protein: 0.9, fat: 0.2, carbs: 10, serving: 100, unit: 'g' },
    { name: 'Kupus', calories: 25, protein: 1.3, fat: 0.1, carbs: 6, serving: 100, unit: 'g' },
    { name: 'Spanać', calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, serving: 100, unit: 'g' },
    { name: 'Zelena salata', calories: 15, protein: 1.4, fat: 0.2, carbs: 2.9, serving: 100, unit: 'g' },
    { name: 'Brokoli', calories: 34, protein: 2.8, fat: 0.4, carbs: 7, serving: 100, unit: 'g' },
    { name: 'Tikvice', calories: 17, protein: 1.2, fat: 0.3, carbs: 3, serving: 100, unit: 'g' },
    { name: 'Pečurke (šampinjoni)', calories: 22, protein: 3, fat: 0.3, carbs: 3, serving: 100, unit: 'g' },
    { name: 'Grašak (smrznuti)', calories: 81, protein: 5, fat: 0.4, carbs: 14, serving: 100, unit: 'g' },
    { name: 'Boranija', calories: 31, protein: 1.8, fat: 0.1, carbs: 7, serving: 100, unit: 'g' },
    { name: 'Kukuruz šećerac', calories: 86, protein: 3.3, fat: 1.2, carbs: 19, serving: 100, unit: 'g' },
    { name: 'Cvekla', calories: 43, protein: 1.6, fat: 0.2, carbs: 10, serving: 100, unit: 'g' },
    
    // Zimnica i Mahunarke
    { name: 'Pasulj (sirov)', calories: 333, protein: 24, fat: 0.8, carbs: 60, serving: 100, unit: 'g' },
    { name: 'Pasulj (kuvan/konzerva)', calories: 127, protein: 8.7, fat: 0.5, carbs: 23, serving: 100, unit: 'g' },
    { name: 'Sočivo (sirovo)', calories: 353, protein: 25, fat: 1, carbs: 60, serving: 100, unit: 'g' },
    { name: 'Leblebija (konzerva)', calories: 164, protein: 9, fat: 2.6, carbs: 27, serving: 100, unit: 'g' },
    { name: 'Kiseli kupus', calories: 19, protein: 1, fat: 0.1, carbs: 4, serving: 100, unit: 'g' },
    { name: 'Ajvar', calories: 100, protein: 1.5, fat: 6, carbs: 9, serving: 100, unit: 'g' },
    { name: 'Kiseli krastavci', calories: 11, protein: 0.5, fat: 0.1, carbs: 2, serving: 100, unit: 'g' },

    // ==================================================
    // 6. VOĆE
    // ==================================================
    { name: 'Jabuka', calories: 52, protein: 0.3, fat: 0.2, carbs: 14, serving: 100, unit: 'g' },
    { name: 'Banana', calories: 89, protein: 1.1, fat: 0.3, carbs: 23, serving: 100, unit: 'g' },
    { name: 'Narandža', calories: 47, protein: 0.9, fat: 0.1, carbs: 12, serving: 100, unit: 'g' },
    { name: 'Mandarina', calories: 53, protein: 0.8, fat: 0.3, carbs: 13, serving: 100, unit: 'g' },
    { name: 'Limun', calories: 29, protein: 1.1, fat: 0.3, carbs: 9, serving: 100, unit: 'g' },
    { name: 'Jagode', calories: 32, protein: 0.7, fat: 0.3, carbs: 8, serving: 100, unit: 'g' },
    { name: 'Maline', calories: 52, protein: 1.2, fat: 0.7, carbs: 12, serving: 100, unit: 'g' },
    { name: 'Borovnice', calories: 57, protein: 0.7, fat: 0.3, carbs: 14, serving: 100, unit: 'g' },
    { name: 'Trešnje', calories: 63, protein: 1, fat: 0.2, carbs: 16, serving: 100, unit: 'g' },
    { name: 'Šljive', calories: 46, protein: 0.7, fat: 0.3, carbs: 11, serving: 100, unit: 'g' },
    { name: 'Breskve', calories: 39, protein: 0.9, fat: 0.3, carbs: 10, serving: 100, unit: 'g' },
    { name: 'Lubenica', calories: 30, protein: 0.6, fat: 0.2, carbs: 8, serving: 100, unit: 'g' },
    { name: 'Dinja', calories: 34, protein: 0.8, fat: 0.2, carbs: 8, serving: 100, unit: 'g' },
    { name: 'Grožđe', calories: 69, protein: 0.7, fat: 0.2, carbs: 18, serving: 100, unit: 'g' },
    { name: 'Suvo grožđe', calories: 299, protein: 3, fat: 0.5, carbs: 79, serving: 100, unit: 'g' },
    { name: 'Suve šljive', calories: 240, protein: 2.2, fat: 0.4, carbs: 64, serving: 100, unit: 'g' },
    { name: 'Urme', calories: 282, protein: 2.5, fat: 0.4, carbs: 75, serving: 100, unit: 'g' },

    // ==================================================
    // 7. ORAŠASTI PLODOVI, ULJA I ZAČINI
    // ==================================================
    { name: 'Orasi', calories: 654, protein: 15, fat: 65, carbs: 14, serving: 100, unit: 'g' },
    { name: 'Badem', calories: 579, protein: 21, fat: 50, carbs: 22, serving: 100, unit: 'g' },
    { name: 'Lešnik', calories: 628, protein: 15, fat: 61, carbs: 17, serving: 100, unit: 'g' },
    { name: 'Kikiriki (pečeni)', calories: 585, protein: 24, fat: 50, carbs: 21, serving: 100, unit: 'g' },
    { name: 'Suncokret (očišćen)', calories: 584, protein: 21, fat: 51, carbs: 20, serving: 100, unit: 'g' },
    { name: 'Bundevino seme', calories: 559, protein: 30, fat: 49, carbs: 11, serving: 100, unit: 'g' },
    
    // Ulja
    { name: 'Suncokretovo ulje', calories: 884, protein: 0, fat: 100, carbs: 0, serving: 100, unit: 'ml' },
    { name: 'Maslinovo ulje', calories: 884, protein: 0, fat: 100, carbs: 0, serving: 100, unit: 'ml' },
    { name: 'Svinjska mast', calories: 900, protein: 0, fat: 100, carbs: 0, serving: 100, unit: 'g' },
    { name: 'Kokosovo ulje', calories: 862, protein: 0, fat: 100, carbs: 0, serving: 100, unit: 'ml' },
    
    // Dodaci
    { name: 'Kečap', calories: 110, protein: 1, fat: 0.1, carbs: 26, serving: 100, unit: 'g' },
    { name: 'Majonez', calories: 680, protein: 1, fat: 75, carbs: 0.6, serving: 100, unit: 'g' },
    { name: 'Senf', calories: 66, protein: 4, fat: 4, carbs: 5, serving: 100, unit: 'g' },
    { name: 'Med', calories: 304, protein: 0.3, fat: 0, carbs: 82, serving: 100, unit: 'g' },
    { name: 'Šećer', calories: 387, protein: 0, fat: 0, carbs: 100, serving: 100, unit: 'g' },

    // ==================================================
    // 8. GRICKALICE I SLATKIŠI (KUPOVNI)
    // ==================================================
    { name: 'Plazma keks', calories: 440, protein: 8, fat: 12, carbs: 70, serving: 100, unit: 'g' },
    { name: 'Mlevena plazma', calories: 440, protein: 8, fat: 12, carbs: 70, serving: 100, unit: 'g' },
    { name: 'Petit keks', calories: 430, protein: 7, fat: 10, carbs: 75, serving: 100, unit: 'g' },
    { name: 'Jaffa keks', calories: 370, protein: 4, fat: 8, carbs: 70, serving: 100, unit: 'g' },
    { name: 'Munchmallow', calories: 380, protein: 4, fat: 11, carbs: 65, serving: 100, unit: 'g' },
    { name: 'Napolitanke', calories: 520, protein: 5, fat: 28, carbs: 62, serving: 100, unit: 'g' },
    { name: 'Čokolada (mlečna)', calories: 535, protein: 7, fat: 30, carbs: 59, serving: 100, unit: 'g' },
    { name: 'Čokolada (crna)', calories: 580, protein: 8, fat: 42, carbs: 35, serving: 100, unit: 'g' },
    { name: 'Eurokrem / Nutella', calories: 540, protein: 5, fat: 31, carbs: 58, serving: 100, unit: 'g' },
    { name: 'Smoki', calories: 510, protein: 13, fat: 28, carbs: 50, serving: 100, unit: 'g' },
    { name: 'Čips', calories: 530, protein: 6, fat: 35, carbs: 53, serving: 100, unit: 'g' },
    { name: 'Slani štapići', calories: 400, protein: 10, fat: 6, carbs: 75, serving: 100, unit: 'g' },
    { name: 'Kokice (gotove)', calories: 387, protein: 13, fat: 15, carbs: 55, serving: 100, unit: 'g' },

    // ==================================================
    // 9. NAPICI I SUPLEMENTI
    // ==================================================
    { name: 'Kafa (bez šećera)', calories: 2, protein: 0.1, fat: 0, carbs: 0.4, serving: 100, unit: 'ml' },
    { name: 'Coca-Cola', calories: 42, protein: 0, fat: 0, carbs: 10.6, serving: 100, unit: 'ml' },
    { name: 'Coca-Cola Zero', calories: 0, protein: 0, fat: 0, carbs: 0, serving: 100, unit: 'ml' },
    { name: 'Sok (jabuka/pomorandža)', calories: 45, protein: 0.5, fat: 0, carbs: 11, serving: 100, unit: 'ml' },
    { name: 'Pivo', calories: 43, protein: 0.5, fat: 0, carbs: 3.5, serving: 100, unit: 'ml' },
    { name: 'Vino', calories: 85, protein: 0.1, fat: 0, carbs: 2.6, serving: 100, unit: 'ml' },
    { name: 'Rakija', calories: 230, protein: 0, fat: 0, carbs: 0, serving: 100, unit: 'ml' },
    { name: 'Whey Protein (1 merica)', calories: 120, protein: 24, fat: 1.5, carbs: 3, serving: 1, unit: 'kom' },
    { name: 'Kreatin', calories: 0, protein: 0, fat: 0, carbs: 0, serving: 5, unit: 'g' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = foods;
}