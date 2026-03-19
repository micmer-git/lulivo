export const MENU = {
  pizzeRosse: {
    title: 'Pizze Rosse',
    icon: '🔴',
    items: [
      { id: 'margherita', name: 'Margherita', price: 6.00, desc: 'fior di latte, basilico, polpa di pomodoro' },
      { id: 'marinara', name: 'Marinara', price: 5.00, desc: 'polpa di pomodoro, aglio, origano di Pantelleria' },
      { id: 'alice', name: 'Alice', price: 9.00, desc: 'burrata, alici, origano di Pantelleria, polpa di pomodoro' },
      { id: 'americana', name: 'Americana', price: 7.50, desc: 'wurstel, patatine fritte, fior di latte, polpa di pomodoro' },
      { id: 'americana-2', name: 'Americana 2.0', price: 8.50, desc: 'scamorza, wurstel fritti, patatine fritte, polpa di pomodoro' },
      { id: 'amatriciana', name: 'Amatriciana', price: 8.50, desc: 'fior di latte, guanciale, pecorino, cipolle, pepe, basilico, polpa di pomodoro' },
      { id: 'bufala', name: 'Bufala', price: 8.00, desc: 'bufala D.O.P., basilico, polpa di pomodoro' },
      { id: 'caprese', name: 'Caprese', price: 9.50, desc: 'bufala D.O.P., pomodorini, rucola, scaglie di grana padano, glassa d\'aceto (fredda)' },
      { id: 'capricciosa', name: 'Capricciosa', price: 9.00, desc: 'fior di latte, prosciutto cotto, funghi champignon, carciofi, olive riviera, polpa di pomodoro' },
      { id: 'crudaiola', name: 'Crudaiola', price: 10.50, desc: 'burrata, crudo, pomodorini, basilico (fredda)' },
      { id: 'cru-e-ru', name: 'Cru e Ru', price: 9.00, desc: 'fior di latte, crudo, rucola, polpa di pomodoro' },
      { id: 'diavola', name: 'Diavola', price: 7.50, desc: 'fior di latte, grana, spianata calabra, polpa di pomodoro' },
      { id: 'lulivo', name: 'L\'Ulivo', price: 11.50, desc: 'burrata, grana, peperoni, olive riviera, spianata calabra, polpa di pomodoro' },
      { id: 'miracolo', name: 'Miracolo di San Gennaro', price: 10.00, desc: 'fior di latte, bufala, grana, crudo, basilico, pelati San Marzano' },
      { id: 'napoli', name: 'Napoli', price: 7.00, desc: 'fior di latte, alici, origano di Pantelleria, polpa di pomodoro' },
      { id: 'nicoli', name: 'Nicoli', price: 8.00, desc: 'scamorza, salsiccia, cipolle, basilico, polpa di pomodoro' },
      { id: 'norma', name: 'Norma', price: 7.50, desc: 'scamorza, melanzane, prosciutto cotto, basilico, polpa di pomodoro' },
      { id: 'pieru', name: 'Pierù', price: 8.00, desc: 'fior di latte, peperoni, salsiccia, grana, polpa di pomodoro' },
      { id: 'prosciutto-funghi', name: 'Prosciutto e Funghi', price: 8.00, desc: 'fior di latte, prosciutto cotto, funghi champignon, polpa di pomodoro' },
      { id: 'romana', name: 'Romana', price: 8.00, desc: 'fior di latte, capperi, olive riviera, origano di Pantelleria, polpa di pomodoro' },
      { id: 'tonno-cipolle', name: 'Tonno e Cipolle', price: 8.00, desc: 'fior di latte, tonno, cipolle, origano di Pantelleria, polpa di pomodoro' },
      { id: 'vegetariana', name: 'Vegetariana', price: 8.00, desc: 'fior di latte, zucchine, melanzane, peperoni, grana, basilico, polpa di pomodoro' },
    ]
  },
  pizzeBianche: {
    title: 'Pizze Bianche',
    icon: '⚪',
    items: [
      { id: '4-formaggi', name: '4 Formaggi D.O.P.', price: 8.50, desc: 'gorgonzola D.O.P., taleggio D.O.P., ricotta, fior di latte' },
      { id: 'alfredo-piatti', name: 'Alfredo Piatti', price: 9.50, desc: 'zucchine, fior di latte, ricotta, brie, guanciale, pepe, menta' },
      { id: 'bagai', name: 'Bagai', price: 7.50, desc: 'fior di latte, salsiccia, patatine fritte' },
      { id: 'bella-vista', name: 'Bella Vista', price: 10.00, desc: 'pomodorini, rucola, fior di latte, bufala D.O.P., crudo, scaglie di grana padano, glassa d\'aceto' },
      { id: 'bergamasca', name: 'Bergamasca', price: 8.50, desc: 'funghi porcini, salsiccia, fior di latte, taleggio D.O.P.' },
      { id: 'romantica', name: 'Romantica', price: 8.50, desc: 'carciofi, fior di latte, pecorino, salsiccia, origano di Pantelleria' },
      { id: 'carbonara', name: 'Carbonara', price: 8.50, desc: 'guanciale, uovo, fior di latte, pecorino, pepe' },
      { id: 'duca', name: 'Duca', price: 11.00, desc: 'porcini, crudo, bufala D.O.P., basilico' },
      { id: 'focaccia', name: 'Focaccia', price: 4.50, desc: 'olio extravergine d\'oliva, origano di Pantelleria, sale' },
      { id: 'luna', name: 'Luna', price: 9.50, desc: 'pomodorini, basilico, fior di latte, ricotta, grana, guanciale, glassa d\'aceto, pepe' },
      { id: 'panzanella', name: 'Panzanella', price: 8.50, desc: 'melanzane, carciofi, tonno, fior di latte, capperi, peperoni' },
      { id: 'partenopea', name: 'Partenopea', price: 9.50, desc: 'friarielli, ricotta, scamorza, spianata calabra' },
      { id: 'salsiccia-friarielli', name: 'Salsiccia e Friarielli', price: 8.00, desc: 'friarielli, salsiccia, fior di latte, grana' },
      { id: 'speck-brie', name: 'Speck e Brie', price: 8.50, desc: 'funghi porcini, speck, brie, fior di latte' },
      { id: 'vetta', name: 'Vetta', price: 7.50, desc: 'zucchine, funghi champignon, scamorza, speck, pepe' },
      { id: 'veneta', name: 'Veneta', price: 9.50, desc: 'radicchio, scamorza, speck' },
      { id: 'violetta', name: 'Violetta', price: 8.50, desc: 'funghi champignon, radicchio, fior di latte, taleggio D.O.P.' },
      { id: 'zola-pere', name: 'Zola e Pere', price: 8.00, desc: 'noci, pere, gorgonzola D.O.P., fior di latte' },
    ]
  },
  calzoni: {
    title: 'Calzoni',
    icon: '🥟',
    items: [
      { id: 'calzone-5formaggi', name: '5 Formaggi', price: 8.50, desc: 'fior di latte, gorgonzola D.O.P., brie, ricotta, pecorino' },
      { id: 'calzone-farcito', name: 'Farcito', price: 8.50, desc: 'fior di latte, prosciutto cotto, funghi champignon, carciofi, polpa di pomodoro' },
      { id: 'calzone-tradizionale', name: 'Tradizionale', price: 8.00, desc: 'fior di latte, prosciutto cotto, ricotta, grana, basilico, polpa di pomodoro' },
      { id: 'calzone-vegetariano', name: 'Vegetariano', price: 7.00, desc: 'fior di latte, ricotta, melanzane, zucchine, peperoni, grana, basilico, polpa di pomodoro' },
      { id: 'calzone-presidenziale', name: 'Presidenziale', price: 9.00, desc: 'zola, brie, fior di latte, grana, spianata calabra' },
    ]
  },
  panuozzi: {
    title: 'Panuozzi',
    icon: '🥖',
    items: [
      { id: 'moser', name: 'Moser', price: 7.50, desc: 'fior di latte, brie, speck' },
      { id: 'nibali', name: 'Nibali', price: 7.00, desc: 'ricotta, pomodorini, melanzane, basilico, capperi' },
      { id: 'gimondi', name: 'Gimondi', price: 7.00, desc: 'fior di latte, crudo, rucola' },
      { id: 'sagan', name: 'Sagan', price: 7.50, desc: 'scamorza, prosciutto cotto, olive riviera' },
      { id: 'pantani', name: 'Pantani', price: 7.50, desc: 'salsiccia, scamorza, friarielli' },
      { id: 'magrini', name: 'Magrini', price: 6.00, desc: 'nutella' },
    ]
  },
  fritti: {
    title: 'Fritti',
    icon: '🍟',
    items: [
      { id: 'bocconcini-pollo', name: 'Bocconcini di Pollo', price: 3.50, desc: '6 pezzi' },
      { id: 'mozzarelle-impanate', name: 'Mozzarelle Impanate', price: 3.00, desc: '6 pezzi' },
      { id: 'olive-ascolana', name: 'Olive all\'Ascolana', price: 3.50, desc: '6 pezzi' },
      { id: 'patatine-fritte', name: 'Patatine Fritte', price: 3.00, desc: '' },
    ]
  }
};

export const EXTRAS = {
  cornicioneRicotta: { name: 'Cornicione ripieno di ricotta', price: 2.00, note: 'Lun–Gio' },
};

export const DELIVERY = {
  mozzo: { label: 'Mozzo', price: 1.00 },
  limitrofi: { label: 'Zone limitrofe', price: 2.00 },
  singola: { label: 'Supplemento pizza singola', price: 2.00 },
};
