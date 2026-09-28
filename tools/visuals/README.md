# Візуали для постів

Рендерить статичні візуали за брендбуком (кольори, Nyght Serif + Commissioner, поля 96px, логотип, нумерація слайдів) у PNG.

1. Скопіюйте `NyghtSerif-Medium.ttf` і `NyghtSerif-MediumItalic.ttf` з архіву шрифту в `tools/visuals/fonts/`.
2. Тексти кадрів — у масиві `SETS` в `index.html` (`*слово*` — акцент курсивом).
3. `OUT=brand/content-02 python3 tools/visuals/server.py` і відкрийте http://localhost:8123/#save — файли з'являться в папці OUT.
