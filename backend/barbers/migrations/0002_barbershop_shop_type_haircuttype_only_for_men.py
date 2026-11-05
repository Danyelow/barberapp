from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('barbers', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='barbershop',
            name='shop_type',
            field=models.CharField(
                choices=[
                    ('hombres', 'Peluquería de hombres'),
                    ('mujeres', 'Peluquería de mujeres'),
                ],
                default='hombres',
                help_text='Tipo de peluquería: de hombres o de mujeres.',
                max_length=10,
            ),
        ),
        migrations.RenameField(
            model_name='haircuttype',
            old_name='only_for_women',
            new_name='only_for_men',
        ),
        migrations.AlterField(
            model_name='haircuttype',
            name='only_for_men',
            field=models.BooleanField(
                default=False,
                help_text='Restringe este servicio a clientes hombres (p. ej., arreglo o afeitado de barba).',
            ),
        ),
    ]
