begin;

create or replace function public.update_assigned_delivery_status(
  target_delivery_id uuid,
  target_status public.delivery_status,
  target_failure_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  delivery_row public.deliveries%rowtype;
  order_status_value public.order_status;
begin
  if not public.has_role('delivery_agent') then
    raise exception 'A delivery-agent account is required';
  end if;
  select * into delivery_row
  from public.deliveries
  where id = target_delivery_id and public.is_assigned_delivery(id)
  for update;
  if not found then raise exception 'Delivery not found or not assigned to you'; end if;
  if target_status not in ('picked_up', 'in_transit', 'delivered', 'failed') then
    raise exception 'Unsupported delivery status';
  end if;

  update public.deliveries
  set status = target_status,
      failure_reason = case when target_status = 'failed' then nullif(btrim(target_failure_reason), '') else failure_reason end
  where id = target_delivery_id
  returning * into delivery_row;

  order_status_value := case
    when target_status in ('picked_up', 'in_transit') then 'out_for_delivery'::public.order_status
    when target_status = 'delivered' then 'delivered'::public.order_status
    else null
  end;
  if order_status_value is not null then
    perform set_config('quickmart.internal_order_recalculation', 'true', true);
    update public.orders
    set status = order_status_value,
        delivered_at = case when order_status_value = 'delivered' then now() else delivered_at end
    where id = delivery_row.order_id and status <> order_status_value;
    perform set_config('quickmart.internal_order_recalculation', 'false', true);
  end if;

  if target_status in ('delivered', 'failed') then
    update public.delivery_agents da
    set status = case
      when exists (
        select 1 from public.deliveries d
        where d.delivery_agent_id = da.id
          and d.status in ('assigned', 'picked_up', 'in_transit')
      ) then 'busy'::public.delivery_agent_status
      else 'available'::public.delivery_agent_status
    end
    where da.id = delivery_row.delivery_agent_id;
  end if;

  return jsonb_build_object('id', delivery_row.id, 'status', delivery_row.status);
end;
$$;

grant execute on function public.update_assigned_delivery_status(uuid, public.delivery_status, text)
to authenticated;

commit;
