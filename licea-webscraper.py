"""
Scraper do pobierania progów punktowych liceów w Krakowie ze strony otouczelnie.pl

Wymagania:
- Python 3.7+
- Selenium: pip install selenium
- ChromeDriver: https://chromedriver.chromium.org/downloads
  (lub użyj: pip install webdriver-manager)

Użycie:
    python licea-webscraper.py
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import csv
import time

BASE_URL = "https://www.otouczelnie.pl/progi-punktowe/licea/miasto/298/Krakow/2025-2026"

def setup_driver():
    """Konfiguruje i zwraca driver Selenium."""
    options = webdriver.ChromeOptions()
    # Usuń komentarz poniżej, aby uruchomić w trybie headless (bez okna przeglądarki)
    # options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    try:
        # Spróbuj użyć webdriver-manager (jeśli jest zainstalowany)
        try:
            from selenium.webdriver.chrome.service import Service
            from webdriver_manager.chrome import ChromeDriverManager
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
        except ImportError:
            # Jeśli webdriver-manager nie jest zainstalowany, użyj standardowego ChromeDriver
            driver = webdriver.Chrome(options=options)
        
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        return driver
    except Exception as e:
        print(f"Błąd podczas uruchamiania ChromeDriver: {e}")
        print("\nRozwiązania:")
        print("1. Zainstaluj ChromeDriver: https://chromedriver.chromium.org/downloads")
        print("2. Lub zainstaluj webdriver-manager: pip install webdriver-manager")
        raise

def accept_cookies(driver):
    """Akceptuje dialog cookies jeśli się pojawi."""
    try:
        # Poczekaj na pojawienie się dialogu cookies (maksymalnie 5 sekund)
        print("Sprawdzanie dialogu cookies...")
        
        # Spróbuj znaleźć przycisk na różne sposoby
        accept_button = None
        
        # Metoda 1: Przycisk z tekstem "Akceptuję"
        try:
            accept_button = WebDriverWait(driver, 3).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Akceptuję')]"))
            )
        except TimeoutException:
            pass
        
        # Metoda 2: Przycisk w dialogu
        if not accept_button:
            try:
                accept_button = driver.find_element(By.XPATH, "//dialog//button[contains(text(), 'Akceptuję')]")
            except NoSuchElementException:
                pass
        
        # Metoda 3: Przycisk z aria-label lub innym atrybutem
        if not accept_button:
            try:
                accept_button = driver.find_element(By.XPATH, "//button[@aria-label='Akceptuję' or contains(@class, 'accept')]")
            except NoSuchElementException:
                pass
        
        if accept_button:
            print("Znaleziono dialog cookies, akceptowanie...")
            # Przewiń do przycisku jeśli potrzeba
            driver.execute_script("arguments[0].scrollIntoView(true);", accept_button)
            time.sleep(0.5)
            accept_button.click()
            time.sleep(1)  # Poczekaj na zamknięcie dialogu
            print("Dialog cookies zaakceptowany")
        else:
            print("Dialog cookies nie znaleziony (może już został zaakceptowany lub nie pojawił się)")
            
    except TimeoutException:
        # Dialog cookies nie pojawił się lub już został zaakceptowany
        print("Dialog cookies nie znaleziony (może już został zaakceptowany)")
    except Exception as e:
        print(f"Błąd podczas akceptowania cookies: {e}")
        # Kontynuuj mimo błędu

def expand_all_classes(driver):
    """Kliknie wszystkie przyciski 'rozwiń' na stronie."""
    try:
        # Poczekaj na załadowanie strony
        print("Oczekiwanie na załadowanie tabeli...")
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.TAG_NAME, "table"))
        )
        print("Tabela załadowana")
        
        # Poczekaj dodatkową chwilę na pełne załadowanie JavaScript
        time.sleep(2)
        
        # Spróbuj różnych selektorów
        expand_buttons = []
        
        # Metoda 1: Linki z tekstem "rozwiń"
        try:
            buttons1 = driver.find_elements(By.XPATH, "//a[contains(text(), 'rozwiń')]")
            if buttons1:
                expand_buttons = buttons1
                print(f"Metoda 1: Znaleziono {len(expand_buttons)} przycisków 'rozwiń' przez tekst")
        except Exception as e:
            print(f"Metoda 1 nie zadziałała: {e}")
        
        # Metoda 2: Linki z href="#" zawierające "rozwiń"
        if not expand_buttons:
            try:
                buttons2 = driver.find_elements(By.XPATH, "//a[@href='#' and contains(text(), 'rozwiń')]")
                if buttons2:
                    expand_buttons = buttons2
                    print(f"Metoda 2: Znaleziono {len(expand_buttons)} przycisków 'rozwiń' przez href='#'")
            except Exception as e:
                print(f"Metoda 2 nie zadziałała: {e}")
        
        # Metoda 3: Wszystkie linki w tabeli i filtrowanie
        if not expand_buttons:
            try:
                all_links = driver.find_elements(By.XPATH, "//table//a")
                expand_buttons = [link for link in all_links if 'rozwiń' in link.text.lower()]
                if expand_buttons:
                    print(f"Metoda 3: Znaleziono {len(expand_buttons)} przycisków 'rozwiń' przez filtrowanie linków")
            except Exception as e:
                print(f"Metoda 3 nie zadziałała: {e}")
        
        # Metoda 4: Znajdź przez częściowy tekst (case-insensitive)
        if not expand_buttons:
            try:
                buttons4 = driver.find_elements(By.XPATH, "//a[contains(translate(text(), 'ROZWIŃ', 'rozwiń'), 'rozwiń')]")
                if buttons4:
                    expand_buttons = buttons4
                    print(f"Metoda 4: Znaleziono {len(expand_buttons)} przycisków 'rozwiń' (case-insensitive)")
            except Exception as e:
                print(f"Metoda 4 nie zadziałała: {e}")
        
        # Metoda 5: Użyj selektora CSS
        if not expand_buttons:
            try:
                # Znajdź wszystkie linki w tabeli i sprawdź ich tekst
                buttons5 = driver.find_elements(By.CSS_SELECTOR, "table a")
                expand_buttons = [btn for btn in buttons5 if 'rozwiń' in btn.text.lower()]
                if expand_buttons:
                    print(f"Metoda 5: Znaleziono {len(expand_buttons)} przycisków 'rozwiń' przez CSS selector")
            except Exception as e:
                print(f"Metoda 5 nie zadziałała: {e}")
        
        # Metoda 6: Użyj JavaScript do znalezienia wszystkich linków z tekstem "rozwiń" i kliknij je bezpośrednio
        if not expand_buttons:
            try:
                script = """
                var links = document.querySelectorAll('a');
                var count = 0;
                for (var i = 0; i < links.length; i++) {
                    if (links[i].textContent.toLowerCase().includes('rozwiń')) {
                        links[i].click();
                        count++;
                    }
                }
                return count;
                """
                clicked_count = driver.execute_script(script)
                if clicked_count and clicked_count > 0:
                    print(f"Metoda 6: Kliknięto {clicked_count} przycisków 'rozwiń' przez JavaScript")
                    time.sleep(2)  # Poczekaj na rozwinięcie
                    # Znajdź przyciski ponownie dla dalszego przetwarzania
                    expand_buttons = driver.find_elements(By.XPATH, "//a[contains(text(), 'rozwiń')]")
            except Exception as e:
                print(f"Metoda 6 nie zadziałała: {e}")
        
        # Debug: Wyświetl wszystkie linki w tabeli
        if not expand_buttons:
            print("\nDEBUG: Szukanie wszystkich linków w tabeli...")
            try:
                all_table_links = driver.find_elements(By.XPATH, "//table//a")
                print(f"Znaleziono {len(all_table_links)} linków w tabeli")
                for i, link in enumerate(all_table_links[:10]):  # Pokaż pierwsze 10
                    try:
                        text = link.text.strip()
                        href = link.get_attribute("href")
                        print(f"  Link {i+1}: tekst='{text}', href='{href}'")
                    except:
                        pass
            except Exception as e:
                print(f"Błąd podczas debugowania: {e}")
        
        print(f"Łącznie znaleziono {len(expand_buttons)} przycisków 'rozwiń'")
        
        # Kliknij każdy przycisk
        if expand_buttons:
            print(f"Rozpoczynanie rozwijania {len(expand_buttons)} szkół...")
            for i, button in enumerate(expand_buttons):
                try:
                    # Jeśli button jest z JavaScript, może być dict/list, więc znajdź go ponownie
                    if isinstance(button, dict) or not hasattr(button, 'click'):
                        # Znajdź przycisk ponownie przez indeks
                        all_links = driver.find_elements(By.XPATH, "//a[contains(text(), 'rozwiń')]")
                        if i < len(all_links):
                            button = all_links[i]
                        else:
                            continue
                    
                    # Przewiń do przycisku
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", button)
                    time.sleep(0.3)  # Krótka pauza przed kliknięciem
                    
                    # Spróbuj kliknąć przez JavaScript (bardziej niezawodne)
                    try:
                        driver.execute_script("arguments[0].click();", button)
                    except:
                        # Jeśli JavaScript nie zadziała, spróbuj normalnego kliknięcia
                        try:
                            button.click()
                        except:
                            # Ostatnia próba - użyj akcji
                            from selenium.webdriver.common.action_chains import ActionChains
                            ActionChains(driver).move_to_element(button).click().perform()
                    
                    time.sleep(0.4)  # Poczekaj na rozwinięcie klas
                    
                    if (i + 1) % 10 == 0:
                        print(f"Rozwinięto {i + 1}/{len(expand_buttons)} szkół...")
                except Exception as e:
                    print(f"Błąd przy klikaniu przycisku {i + 1}: {e}")
                    continue
        else:
            print("UWAGA: Nie znaleziono żadnych przycisków 'rozwiń'!")
            print("Sprawdzanie struktury strony...")
            # Spróbuj znaleźć tabelę i wyświetlić jej strukturę
            try:
                table = driver.find_element(By.TAG_NAME, "table")
                rows = table.find_elements(By.TAG_NAME, "tr")
                print(f"Znaleziono tabelę z {len(rows)} wierszami")
                # Wyświetl pierwsze kilka wierszy
                for i, row in enumerate(rows[:5]):
                    try:
                        cells = row.find_elements(By.TAG_NAME, "td")
                        if cells:
                            print(f"  Wiersz {i+1}: {len(cells)} komórek, pierwsza komórka: '{cells[0].text[:50]}'")
                    except:
                        pass
            except Exception as e:
                print(f"Błąd podczas sprawdzania struktury: {e}")
        
        # Poczekaj chwilę na pełne załadowanie wszystkich klas
        time.sleep(2)
        print("Wszystkie klasy zostały rozwinięte")
        
    except TimeoutException:
        print("Timeout podczas oczekiwania na załadowanie strony")
    except Exception as e:
        print(f"Błąd podczas rozwijania klas: {e}")

def scrape_data(driver):
    """Pobiera dane o szkołach i klasach z rozwiniętej strony."""
    data = []
    
    try:
        # Znajdź wszystkie wiersze w tabeli
        rows = driver.find_elements(By.XPATH, "//table//tr")
        
        current_school = None
        
        for row in rows:
            try:
                cells = row.find_elements(By.TAG_NAME, "td")
                
                if len(cells) >= 2:
                    # Sprawdź, czy to wiersz ze szkołą czy z klasą
                    school_cell = cells[0]
                    threshold_cell = cells[1]
                    
                    school_text = school_cell.text.strip()
                    threshold_text = threshold_cell.text.strip()
                    
                    # Jeśli w komórce szkoły jest link, to jest to wiersz ze szkołą
                    try:
                        school_link = school_cell.find_element(By.TAG_NAME, "a")
                        # To jest wiersz ze szkołą
                        current_school = school_text
                    except NoSuchElementException:
                        # To może być wiersz z klasą (jeśli nie ma linku w pierwszej komórce)
                        # Sprawdź, czy threshold_text wygląda jak próg punktowy (liczba)
                        if current_school and threshold_text and (
                            threshold_text.replace('.', '').replace(',', '').isdigit() or
                            'od' in threshold_text.lower() or
                            threshold_text.replace('.', '').replace(',', '').replace('-', '').isdigit()
                        ):
                            # To jest wiersz z klasą
                            class_name = school_text
                            # Sprawdź, czy to nie jest przypadkiem nazwa szkoły
                            if not any(word in class_name.lower() for word in ['lo', 'liceum', 'licea']):
                                data.append((current_school, class_name, threshold_text))
                        elif not current_school:
                            # Jeśli nie mamy jeszcze szkoły, może to być pierwsza szkoła
                            # Sprawdź, czy threshold_text zawiera "od" lub "do" (zakres progów)
                            if 'od' in threshold_text.lower() or 'do' in threshold_text.lower():
                                current_school = school_text
                                
            except Exception as e:
                continue
        
        # Alternatywna metoda: znajdź wszystkie wiersze z klasami bezpośrednio
        # Klasy mają strukturę: pierwsza komórka to nazwa klasy, druga to próg
        class_rows = driver.find_elements(By.XPATH, "//table//tr[td[2][not(contains(text(), 'od')) and not(contains(text(), 'więcej')) and not(contains(text(), 'rozwiń')) and not(contains(text(), 'zwiń'))]]")
        
        # Przejdź przez wszystkie wiersze i znajdź klasy
        all_rows = driver.find_elements(By.XPATH, "//table//tbody//tr")
        current_school_name = None
        
        for row in all_rows:
            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) >= 2:
                first_cell = cells[0].text.strip()
                second_cell = cells[1].text.strip()
                
                # Sprawdź, czy pierwsza komórka zawiera link do szkoły
                try:
                    link = cells[0].find_element(By.TAG_NAME, "a")
                    # To jest szkoła
                    current_school_name = first_cell
                except NoSuchElementException:
                    # To może być klasa
                    # Sprawdź, czy druga komórka wygląda jak próg punktowy
                    if current_school_name and second_cell:
                        # Sprawdź, czy to nie jest przycisk rozwiń/zwiń
                        if second_cell not in ['rozwiń', 'zwiń', 'więcej'] and 'od' not in second_cell.lower():
                            # Sprawdź, czy druga komórka to liczba (próg punktowy)
                            if second_cell.replace('.', '').replace(',', '').isdigit():
                                data.append((current_school_name, first_cell, second_cell))
        
    except Exception as e:
        print(f"Błąd podczas pobierania danych: {e}")
    
    return data

def scrape_data_improved(driver):
    """Ulepszona metoda pobierania danych."""
    data = []
    
    try:
        # Znajdź wszystkie wiersze w tabeli
        rows = driver.find_elements(By.XPATH, "//table//tbody//tr")
        
        current_school = None
        
        for row in rows:
            try:
                cells = row.find_elements(By.TAG_NAME, "td")
                
                if len(cells) < 2:
                    continue
                
                first_cell_text = cells[0].text.strip()
                second_cell_text = cells[1].text.strip()
                
                # Sprawdź, czy pierwsza komórka ma link (to szkoła)
                has_link = False
                try:
                    link = cells[0].find_element(By.TAG_NAME, "a")
                    # Sprawdź, czy link nie prowadzi tylko do "#" (to byłby przycisk rozwiń)
                    href = link.get_attribute("href")
                    if href and href != "#" and "/progi-punktowe" in href:
                        has_link = True
                except NoSuchElementException:
                    pass
                
                if has_link:
                    # To jest wiersz ze szkołą
                    current_school = first_cell_text
                elif current_school:
                    # To może być wiersz z klasą
                    # Sprawdź, czy druga komórka to próg punktowy (liczba)
                    if second_cell_text:
                        # Pomiń przyciski rozwiń/zwiń/więcej i reklamy
                        if second_cell_text.lower() not in ['rozwiń', 'zwiń', 'więcej', 'advertisement']:
                            # Sprawdź, czy druga komórka zawiera "od" lub "do" (zakres) - to nie jest klasa
                            if 'od' not in second_cell_text.lower() and 'do' not in second_cell_text.lower():
                                # Sprawdź, czy to liczba (może być z kropką jako separator dziesiętny)
                                # Usuń wszystkie znaki oprócz cyfr i kropki/przecinka
                                clean_threshold = ''.join(c for c in second_cell_text if c.isdigit() or c in '.,-')
                                # Sprawdź, czy po oczyszczeniu mamy liczbę (co najmniej jedną cyfrę)
                                if clean_threshold and clean_threshold.replace('.', '').replace(',', '').replace('-', '').isdigit():
                                    # Sprawdź, czy pierwsza komórka nie jest pusta
                                    # i zaczyna się od słowa "Klasa" lub zawiera typowe oznaczenia klas (np. "IA", "1A", "A")
                                    if first_cell_text:
                                        # Sprawdź, czy to nie jest nazwa szkoły (nie zawiera "LO", "Liceum" itp.)
                                        if not any(word in first_cell_text.lower() for word in ['lo ', ' liceum', ' licea', 'sportowe', 'im.', 'im ']):
                                            # To jest klasa z progiem
                                            data.append((current_school, first_cell_text, second_cell_text))
                                
            except Exception as e:
                continue
                
    except Exception as e:
        print(f"Błąd podczas pobierania danych: {e}")
        import traceback
        traceback.print_exc()
    
    return data

def main():
    """Główna funkcja scrapera."""
    driver = None
    try:
        print("Uruchamianie przeglądarki...")
        driver = setup_driver()
        
        print(f"Ładowanie strony: {BASE_URL}")
        driver.get(BASE_URL)
        
        # Poczekaj na załadowanie strony
        time.sleep(3)
        
        # Najpierw zaakceptuj cookies
        accept_cookies(driver)
        
        # Poczekaj chwilę po akceptacji cookies
        time.sleep(2)
        
        # Rozwiń wszystkie klasy
        print("Rozwijanie klas...")
        expand_all_classes(driver)
        
        # Pobierz dane
        print("Pobieranie danych...")
        data = scrape_data_improved(driver)
        
        print(f"Znaleziono {len(data)} klas")
        
        # Zapis do CSV
        output_file = "progi_licea_krakow_2025_2026.csv"
        with open(output_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["Szkoła", "Klasa", "Próg punktowy"])
            writer.writerows(data)
        
        print(f"Zapisano dane do pliku {output_file}")
        
        # Wyświetl przykładowe dane
        if data:
            print("\nPrzykładowe dane:")
            for i, (school, class_name, threshold) in enumerate(data[:5]):
                print(f"  {school} - {class_name}: {threshold}")
            if len(data) > 5:
                print(f"  ... i {len(data) - 5} więcej")
        
    except Exception as e:
        print(f"Błąd: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if driver:
            driver.quit()
            print("Zamknięto przeglądarkę")

if __name__ == "__main__":
    main()
