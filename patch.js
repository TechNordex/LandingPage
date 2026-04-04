const fs = require('fs');
const p = 'c:/Users/adson.vicente_murtac/Desktop/Landing Page da empresa/LandingPage/app/admin/page.tsx';
let lines = fs.readFileSync(p, 'utf8').split('\n');

const toRestore = [
'                                                <div className="w-9 h-9 rounded-full bg-secondary border border-border overflow-hidden shrink-0">',
'                                                    {w.avatar_url',
'                                                        ? <img src={w.avatar_url} alt={w.name} className="w-full h-full rounded-full object-cover" />',
'                                                        : <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-primary">{w.name.split(\' \').map((n: string) => n[0]).join(\'\')}</div>}',
'                                                </div>',
'                                                <div className="flex-1 min-w-0">',
'                                                    <div className="flex items-center justify-between mb-1.5">',
'                                                        <p className="text-[12px] font-semibold text-foreground truncate">{w.name}</p>',
'                                                        <span className="text-[12px] font-black text-primary">{w.project_count} proj.</span>',
'                                                    </div>',
'                                                    <div className="bg-border/30 h-1.5 rounded-full overflow-hidden">',
'                                                        <div className="h-full bg-primary rounded-full" style={{ width: `${(w.project_count / maxProj) * 100}%` }} />',
'                                                    </div>'
];

// Restore the deleted lines at 2289
lines.splice(2289, 0, ...toRestore);

// Now remove the two extraneous </div> from overview tab at lines 1484, 1485
// Let's verify they are actually </div> exactly:
if (lines[1484].includes('</div>') && lines[1485].includes('</div>')) {
    lines.splice(1484, 2);
    console.log('Fixed overview tab closure successfully.');
} else {
    console.log('Error: Not </div> at 1484/1485. Got:');
    console.log('1484:', lines[1484]);
    console.log('1485:', lines[1485]);
}

fs.writeFileSync(p, lines.join('\n'));
