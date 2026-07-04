alter table pages drop constraint pages_template_check;

alter table pages add constraint pages_template_check
  check (template in ('minimal-grid'));
