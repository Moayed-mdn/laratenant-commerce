import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const locales = ['en', 'ar'];
const files = fs.readdirSync(path.join(localesDir, 'en'));

let hasErrors = false;

for (const file of files) {
  const enKeys = Object.keys(
    JSON.parse(
      fs.readFileSync(
        path.join(localesDir, 'en', file),
        'utf-8',
      ),
    ),
  );

  for (const locale of locales.filter((l) => l !== 'en')) {
    const localePath = path.join(localesDir, locale, file);

    if (!fs.existsSync(localePath)) {
      console.error(`Missing file: ${locale}/${file}`);
      hasErrors = true;
      continue;
    }

    const localeKeys = Object.keys(
      JSON.parse(fs.readFileSync(localePath, 'utf-8')),
    );

    const missing = enKeys.filter((k) => !localeKeys.includes(k));
    const extra = localeKeys.filter((k) => !enKeys.includes(k));

    if (missing.length > 0) {
      console.error(
        `Missing keys in ${locale}/${file}:`,
        missing,
      );
      hasErrors = true;
    }

    if (extra.length > 0) {
      console.error(
        `Extra keys in ${locale}/${file}:`,
        extra,
      );
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  console.error('\n❌ Translation check failed.');
  process.exit(1);
} else {
  console.log('✅ All translation files are consistent.');
}
