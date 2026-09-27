const rules = new Intl.PluralRules("uk");

type Forms = { one: string; few: string; many: string };

export function plural(n: number, forms: Forms): string {
  const r = rules.select(n);
  return r === "one" ? forms.one : r === "few" ? forms.few : forms.many;
}

// Нерозривний пробіл між розрядами: «10 000» не переноситься.
export const formatUah = (n: number) => new Intl.NumberFormat("uk-UA").format(n);
