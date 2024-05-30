echo "Iniciando Backup..."
set DATABASE_CONTAINER=db_task_project
set NAME_BACKUP= ""
set OUTPUT_BACKUP_FILE=E:/proyecto_quisvar/quisvar_proyect_bk/Backup
docker exec -it %DATABASE_CONTAINER% bash -c "pg_dump -U dbtaskmanager -d dbtaskmanager > backup2.sql"
docker exec -it %DATABASE_CONTAINER% bash -c "ls"
timeout /t 15 >nul
if not exist "%OUTPUT_BACKUP_FILE%" (
    mkdir "%OUTPUT_BACKUP_FILE%"
    echo La carpeta se ha creado correctamente.
) else (
    echo La carpeta ya existe.
)

for /f "tokens=1-3 delims=/" %%a in ('date /t') do (
    set DAY=%%a
    set MONTH=%%b
    set YEAR=%%c
)
set FORMATTED_DATE=%DAY%_%MONTH%_%YEAR%
docker cp %DATABASE_CONTAINER%:/dieguin2.sql %OUTPUT_BACKUP_FILE%/"backup_%FORMATTED_DATE%.sql"
echo "Backup terminado..."
exit