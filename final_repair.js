const fs = require('fs');
const p = 'c:/Users/adson.vicente_murtac/Desktop/Landing Page da empresa/LandingPage/app/admin/page.tsx';
let txt = fs.readFileSync(p, 'utf8');

// Fix reports tab (move stray </div> before )})
txt = txt.replace(
`                </div>
            )}
                </div>

                {activeTab === 'team' && (`,
`                    </div>
                </div>
            )}

                {activeTab === 'team' && (`
);

// Fix team tab (remove stray </div> at 2384, and insert it before )})
// Additionally, team tab needs one more </div> to balance completely.
txt = txt.replace(
`                    </div>
                )}
                {activeTab === 'users' && (
                </div>
                    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">`,
`                    </div>
                </div>
                </div>
            )}
            
            {activeTab === 'users' && (
                <div className="animate-fade-in max-w-5xl mx-auto space-y-6">`
);

fs.writeFileSync(p, txt);
console.log('Final repair script executed directly.');
