
$replacements = @{
    'Ã¡Æ’ TICO' = 'Í TICO';
    'aÃ§Ã£o' = 'ação';
    'nÃ£o' = 'não';
    'serÃ£o' = 'serão';
    'diÃ¡rios' = 'diários';
    'atualizaÃ§Ãµes' = 'atualizações';
    'anotaÃ§Ãµes' = 'anotações';
    'vocÃª' = 'você';
    'estÃ¡' = 'está';
    'ficarÃ¡' = 'ficará';
    'visÃ­vel' = 'visível';
    'exclusÃ£o' = 'exclusão';
    'primÃ¡rios' = 'primários';
    'serÃ¡' = 'será';
    'emissÃ£o' = 'emissão';
    'indivÃ­duo' = 'indivíduo';
    'atribuiÃ§Ã£o' = 'atribuição';
    'usuÃ¡rio' = 'usuário';
    'gestÃ£o' = 'gestão';
    'remoÃ§Ã£o' = 'remoção';
    'poderÃ¡' = 'poderá';
    'histÃ³ricos' = 'históricos';
    'relatÃ³rios' = 'relatórios';
    'eficiÃªncia' = 'eficiência';
    'mÃ©tricas' = 'métricas';
    'saÃºde' = 'saúde';
    'operaÃ§Ãµes' = 'operações';
    'atÃ©' = 'até';
    'inÃ­cio' = 'início';
    'duraÃ§Ã£o' = 'duração';
    'conclusÃ£o' = 'conclusão';
    'relaÃ§Ã£o' = 'relação';
    'produÃ§Ã£o' = 'produção';
    'perÃ­odo' = 'período';
    'padrÃ£o' = 'padrão';
    'pÃºblicas' = 'públicas';
    'informaÃ§Ãµes' = 'informações';
    'aprovaÃ§Ã£o' = 'aprovação';
    'revisÃ£o' = 'revisão';
    'decisÃ£o' = 'decisão';
    'pipeline' = 'pipeline';
    'estrutural' = 'estrutural';
    'estÃ£o' = 'estão';
    'avanÃ§a' = 'avança';
    'novidades' = 'novidades';
    'registradas' = 'registradas';
    'serviÃ§os' = 'serviços';
    'soluÃ§Ãµes' = 'soluções';
    'TecnolÃ³gicas' = 'Tecnológicas';
    'atenciosamente' = 'atenciosamente';
    'equipe' = 'equipe';
    'notÃ­cias' = 'notícias';
    'prÃ³ximos' = 'próximos';
    'passos' = 'passos';
    'reuniÃ£o' = 'reunião';
    'horÃ¡rio' = 'horário';
    'disponÃ­vel' = 'disponível';
    'confirmaÃ§Ã£o' = 'confirmação';
    'atenÃ§Ã£o' = 'atenção';
    'Ã­cone' = 'ícone';
    'Ã­cones' = 'ícones';
    'á¢€ ‚¬á¢€ ‚¬' = '──';
    'á¢‚¬¢' = '•';
    'Ã¡' = 'á';
    'Ã©' = 'é';
    'Ã­' = 'í';
    'Ã³' = 'ó';
    'Ãº' = 'ú';
    'Ã¢' = 'â';
    'Ãª' = 'ê';
    'Ã®' = 'î';
    'Ã´' = 'ô';
    'Ã»' = 'û';
    'Ã£' = 'ã';
    'Ãµ' = 'õ';
    'Ã§' = 'ç';
    'Ã€' = 'À';
    'Ã' = 'Á'
}

$files = Get-ChildItem -Path "c:\Users\adson.vicente_murtac\Desktop\Landing Page da empresa\LandingPage\app" -Recurse -Filter "*.tsx"
$files += Get-ChildItem -Path "c:\Users\adson.vicente_murtac\Desktop\Landing Page da empresa\LandingPage\app" -Recurse -Filter "*.ts"
$files += Get-ChildItem -Path "c:\Users\adson.vicente_murtac\Desktop\Landing Page da empresa\LandingPage\components" -Recurse -Filter "*.tsx"

foreach ($f in $files) {
    $path = $f.FullName
    Write-Host "Processing $path..."
    $content = [System.IO.File]::ReadAllText($path)
    $original = $content
    foreach ($key in $replacements.Keys) {
        $content = $content.Replace($key, $replacements[$key])
    }
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($path, $content)
        Write-Host "Fixed encoding for $path"
    }
}
