create table alert
(
    type         varchar(255)                not null,
    tags         jsonb   default '{}'::jsonb not null,
    timestamp    timestamp with time zone    not null,
    resolve      timestamp with time zone,
    last_alert   timestamp with time zone,
    last_trigger timestamp with time zone    not null,
    count        integer default 1           not null,
    mute         boolean default false       not null,
    params       jsonb                       not null,
    constraint alert_pk
        primary key (type, tags, timestamp)
);

alter table alert
    owner to postgres;

create unique index alert_upsert_partial_index
    on alert (type, tags)
    where (resolve IS NULL);

create table "user"
(
    user_id       varchar not null
        constraint user_pk
            primary key,
    grafana_id    integer not null
        constraint user_pk_2
            unique,
    email         varchar
        constraint user_pk_3
            unique,
    telegram_id   bigint
        constraint user_pk_4
            unique,
    subscriptions varchar
);

alter table "user"
    owner to postgres;

create function notify_alert() returns trigger
    language plpgsql
as
$$
begin
    perform pg_notify('alert', row_to_json(new)::text);
    return null;
end;
$$;

alter function notify_alert() owner to postgres;

create trigger insert_alert_trigger
    after insert
    on alert
    for each row
execute procedure notify_alert();

create trigger update_alert_trigger
    after update
    on alert
    for each row
execute procedure notify_alert();

