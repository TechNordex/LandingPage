const fs = require('fs');
const path = 'c:/Users/adson.vicente_murtac/Desktop/Landing Page da empresa/LandingPage/app/admin/page.tsx';
let content = fs.readFileSync(path, 'utf-8');

// Fix Overview (move )} after its wrappers)
// Current end of overview:
// 1480: </div> (closes 1476)
// 1481: )}
// 1482: </div> (closes 1474 - logically, but currently outside)
// 1483: </div> (closes 1246)
// 1484: </div> (closes 1245)
// Let's replace the whole sequence to be safe.
content = content.replace(
`                                        </div>
                )}
                                    </div>
                                </div>
                            </div>`,
`                                        </div>
                                    </div>
                                </div>
                            </div>
                )}`
);

// Fix Projects (currently ends with 1 </div> and )} at 2087-2088)
// Needs to close animate-fade-in (1488) and flex-1 (1487).
content = content.replace(
`                    })}
                </div>
            )}`,
`                    })}
                        </div>
                    </div>
                )}`
);

// Fix Users (currently starts with stray </div> and missing flex-1)
content = content.replace(
`                {activeTab === 'users' && (
                </div>
                    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">`,
`                {activeTab === 'users' && (
                    <div className="flex-1 p-5 lg:p-8 overflow-y-auto custom-scrollbar flex flex-col">
                        <div className="animate-fade-in max-w-5xl mx-auto space-y-6">`
);

// We need to close the two wrappers for Users too.
// Current end of users:
// 2466: </div> (closes 2383)
// 2467: )}
content = content.replace(
`                        </div>
                    </div>
                )}

                {activeTab === 'trash' && (`,
`                        </div>
                    </div>
                </div>
            )}

                {activeTab === 'trash' && (`
);

fs.writeFileSync(path, content);
console.log('Structural fixes applied.');
