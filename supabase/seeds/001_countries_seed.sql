insert into countries (iso_code, name, currency_code, date_format, is_active)
values
  ('BR', 'Brasil', 'BRL', 'DD/MM/YYYY', true)
on conflict (iso_code) do update set name = excluded.name;

insert into countries (iso_code, name, currency_code, date_format, is_active)
values
  ('US', 'United States', 'USD', 'MM/DD/YYYY', true)
on conflict (iso_code) do update set name = excluded.name;

insert into countries (iso_code, name, currency_code, date_format, is_active)
values
  ('ES', 'España', 'EUR', 'DD/MM/YYYY', true)
on conflict (iso_code) do update set name = excluded.name;

